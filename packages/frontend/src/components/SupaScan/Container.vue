<template>
  <div class="supascan-root">
    <!-- CRITICAL: service_role leak banner -->
    <div
      v-if="hasServiceRoleLeak"
      class="supascan-banner"
    >
      <i class="fas fa-skull-crossbones" />
      CRITICAL: Supabase service_role key leak detected in traffic — see Findings for details
    </div>

    <!-- Manual Add Instance modal -->
    <div
      v-if="showAddModal"
      class="modal-overlay"
      @click.self="showAddModal = false"
    >
      <div class="modal-box">
        <div class="modal-title">
          <i class="fas fa-plus" /> Add Supabase Instance
        </div>
        <div class="modal-field">
          <label class="settings-label">Project URL <span style="color:#ef4444">*</span></label>
          <input
            v-model="manualUrl"
            type="text"
            class="settings-input"
            placeholder="https://abcdefghijklmnopqrst.supabase.co"
            @keydown.enter="submitManual"
          >
          <span style="font-size:11px;color:#64748b;">Must contain a valid 20-char project ref</span>
        </div>
        <div class="modal-field">
          <label class="settings-label">Anon Key (JWT)</label>
          <input
            v-model="manualAnonKey"
            type="text"
            class="settings-input"
            placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
            @keydown.enter="submitManual"
          >
          <span style="font-size:11px;color:#64748b;">Optional — the public anon key from your app</span>
        </div>
        <div
          v-if="manualError"
          style="color:#ef4444;font-size:12px;margin-top:4px;"
        >
          <i class="fas fa-triangle-exclamation" /> {{ manualError }}
        </div>
        <div class="modal-actions">
          <button
            class="supascan-btn"
            @click="showAddModal = false"
          >
            Cancel
          </button>
          <button
            class="supascan-btn supascan-btn-primary"
            :disabled="!manualUrl"
            @click="submitManual"
          >
            <i class="fas fa-plus" /> Add Instance
          </button>
        </div>
      </div>
    </div>

    <!-- Header / action bar -->
    <div class="supascan-header">
      <div class="supascan-header-title">
        <i
          class="fas fa-shield-halved"
          style="color:#3ecf8e;"
        />
        SupaScan
        <span style="font-size:10px;color:#8892a4;font-weight:400;">v0.1.0</span>
      </div>

      <div class="supascan-action-bar">
        <button
          class="supascan-btn"
          title="Manually add a Supabase instance"
          @click="openAddModal"
        >
          <i class="fas fa-plus" /> Add Instance
        </button>
        <button
          class="supascan-btn supascan-btn-primary"
          :disabled="!canProbe"
          title="Run read probes (limit=1 per table)"
          @click="runRead"
        >
          <i class="fas fa-eye" /> Read Checks
        </button>
        <label
          class="discovery-toggle"
          title="When on, checks brute-force common/wordlist tables. When off, only tables seen in traffic are checked."
        >
          <input
            v-model="draftSettings.discoveryEnabled"
            type="checkbox"
            @change="persistDiscovery"
          >
          discovery
        </label>
        <button
          class="supascan-btn"
          :disabled="!canProbe"
          title="Write probes (tx=rollback — no data modified)"
          @click="runWrite"
        >
          <i class="fas fa-pen" /> Write Probes
        </button>
        <button
          class="supascan-btn"
          :disabled="!canProbe"
          title="Test open signup"
          @click="runAuth"
        >
          <i class="fas fa-user-plus" /> Auth Check
        </button>
        <button
          class="supascan-btn"
          :disabled="!canProbe"
          title="Enumerate and test RPC functions"
          @click="runRpc"
        >
          <i class="fas fa-code" /> RPC
        </button>
        <button
          class="supascan-btn"
          :disabled="!canProbe || instanceSessions.length < 2"
          :title="instanceSessions.length < 2 ? 'Add 2+ users in the Sessions tab to diff their access' : 'Diff what each user can read to catch broken RLS / IDOR'"
          @click="runIdor"
        >
          <i class="fas fa-users-rectangle" /> IDOR/RLS
        </button>
        <button
          class="supascan-btn"
          :disabled="!canProbe"
          title="Brute-force privileged PostgREST schemas to find privilege escalation (runs as the active session)"
          @click="runRole"
        >
          <i class="fas fa-user-shield" /> Roles
        </button>
        <button
          class="supascan-btn supascan-btn-danger"
          :disabled="!isRunning"
          @click="stopAll"
        >
          <i class="fas fa-stop" /> Stop All
        </button>
        <button
          class="supascan-btn"
          :class="{ active: activeTab === 'settings' }"
          title="Settings"
          @click="activeTab = activeTab === 'settings' ? 'tables' : 'settings'"
        >
          <i class="fas fa-gear" />
        </button>
      </div>
    </div>

    <!-- Active session strip -->
    <div
      v-if="activeUser"
      class="session-strip"
    >
      <span>
        <i class="fas fa-user-check" />
        Checks run as <strong>{{ activeUser.email }}</strong>
        <span style="color:#8892a4;"> (authenticated session)</span>
      </span>
      <button
        class="supascan-btn"
        style="font-size:11px;padding:2px 8px;"
        title="Revert all checks to the anonymous key"
        @click="useAnon"
      >
        <i class="fas fa-user-slash" /> Use anon
      </button>
    </div>

    <!-- Progress messages -->
    <div
      v-if="progressMessages.length > 0"
      class="progress-bar"
    >
      <i
        v-if="isRunning"
        class="fas fa-spinner fa-spin"
      />
      <i
        v-else
        class="fas fa-circle-check"
        style="color:#3ecf8e;"
      />
      {{ progressMessages[progressMessages.length - 1] }}
    </div>

    <!-- Main layout -->
    <div class="supascan-main">
      <InstanceListContainer
        :instances="instances"
        :selected-ref="selectedRef"
        @select="onSelectInstance"
      />

      <div style="flex:1;display:flex;flex-direction:column;overflow:hidden;">
        <!-- Tab bar -->
        <div class="tab-bar">
          <button
            class="tab-btn"
            :class="{ active: activeTab === 'tables' }"
            @click="activeTab = 'tables'"
          >
            <i class="fas fa-table" /> Tables
          </button>
          <button
            class="tab-btn"
            :class="{ active: activeTab === 'storage' }"
            @click="activeTab = 'storage'"
          >
            <i class="fas fa-folder-open" /> Storage
          </button>
          <button
            class="tab-btn"
            :class="{ active: activeTab === 'rpc' }"
            @click="activeTab = 'rpc'"
          >
            <i class="fas fa-code" /> RPC
          </button>
          <button
            class="tab-btn"
            :class="{ active: activeTab === 'roles' }"
            @click="activeTab = 'roles'"
          >
            <i class="fas fa-database" /> Databases
          </button>
          <button
            class="tab-btn"
            :class="{ active: activeTab === 'info' }"
            @click="activeTab = 'info'"
          >
            <i class="fas fa-circle-info" /> Instance Info
          </button>
          <button
            class="tab-btn"
            :class="{ active: activeTab === 'sessions' }"
            @click="activeTab = 'sessions'"
          >
            <i class="fas fa-users" /> Sessions
          </button>
          <button
            class="tab-btn"
            :class="{ active: activeTab === 'signup' }"
            @click="activeTab = 'signup'"
          >
            <i class="fas fa-user-plus" /> Signup
          </button>
          <button
            class="tab-btn"
            :class="{ active: activeTab === 'log' }"
            @click="activeTab = 'log'"
          >
            <i class="fas fa-list-ul" /> Activity Log
          </button>
          <button
            class="tab-btn"
            :class="{ active: activeTab === 'settings' }"
            @click="activeTab = 'settings'"
          >
            <i class="fas fa-gear" /> Settings
          </button>
        </div>

        <!-- Tables tab -->
        <div
          v-if="activeTab === 'tables'"
          class="supascan-content"
        >
          <div
            v-if="!selectedInstance"
            class="empty-state"
          >
            <i class="fas fa-database" />
            <span>Select an instance to view tables</span>
          </div>
          <TableGridContainer
            v-else
            :tables="selectedTables"
            :instance="selectedInstance"
            :sdk="sdk"
          />
        </div>

        <!-- Storage tab -->
        <div
          v-else-if="activeTab === 'storage'"
          class="supascan-content"
        >
          <div
            v-if="!selectedInstance"
            class="empty-state"
          >
            <i class="fas fa-folder-open" />
            <span>Select an instance to view storage</span>
          </div>
          <StorageGridContainer
            v-else
            :instance="selectedInstance"
            :sdk="sdk"
          />
        </div>

        <!-- RPC tab -->
        <div
          v-else-if="activeTab === 'rpc'"
          class="supascan-content"
        >
          <div
            v-if="!selectedInstance"
            class="empty-state"
          >
            <i class="fas fa-code" />
            <span>Select an instance to view RPC functions</span>
          </div>
          <RpcGridContainer
            v-else
            :instance="selectedInstance"
            :sdk="sdk"
          />
        </div>

        <!-- Roles tab -->
        <div
          v-else-if="activeTab === 'roles'"
          class="supascan-content"
        >
          <div
            v-if="!selectedInstance"
            class="empty-state"
          >
            <i class="fas fa-user-shield" />
            <span>Select an instance to run the role check</span>
          </div>
          <RolesGridContainer
            v-else
            :instance="selectedInstance"
            :sdk="sdk"
          />
        </div>

        <!-- Instance info tab -->
        <div
          v-else-if="activeTab === 'info'"
          class="supascan-content"
        >
          <div
            v-if="!selectedInstance"
            class="empty-state"
          >
            <i class="fas fa-database" />
            <span>Select an instance</span>
          </div>
          <div v-else>
            <div class="info-grid">
              <span class="info-key">Project URL</span>
              <span class="info-val">{{ selectedInstance.projectUrl }}</span>

              <span class="info-key">Project Ref</span>
              <span class="info-val">{{ selectedInstance.projectRef }}</span>

              <span class="info-key">Anon Key</span>
              <span
                class="info-val"
                style="word-break:break-all;"
              >
                <span v-if="selectedInstance.anonKey">
                  <div style="display:flex;align-items:flex-start;gap:8px;">
                    <code class="apikey-box">{{ selectedInstance.anonKey }}</code>
                    <button
                      class="supascan-btn"
                      style="flex-shrink:0;"
                      title="Copy anon key"
                      @click="copyKey(selectedInstance.anonKey)"
                    >
                      <i class="fas fa-copy" />
                    </button>
                  </div>
                  <span style="color:#8892a4;">role: {{ selectedInstance.anonKeyRole ?? "?" }}</span>
                </span>
                <span
                  v-else
                  style="color:#64748b;"
                >Not detected</span>
              </span>

              <span class="info-key">Service Role Leak</span>
              <span class="info-val">
                <span
                  v-if="selectedInstance.serviceRoleLeak"
                  style="color:#ef4444;font-weight:700;"
                >
                  <i class="fas fa-skull-crossbones" />
                  DETECTED in {{ selectedInstance.serviceRoleLeak.location }}
                </span>
                <span
                  v-else
                  style="color:#3ecf8e;"
                >None detected</span>
              </span>

              <span class="info-key">Tables (observed)</span>
              <span class="info-val">{{ Object.keys(selectedInstance.tables).length }}</span>

              <span class="info-key">RPCs</span>
              <span class="info-val">
                <div
                  v-if="selectedInstance.rpcs.length > 0"
                  class="chip-list"
                >
                  <span
                    v-for="rpc in selectedInstance.rpcs"
                    :key="rpc"
                    class="chip"
                  >{{ rpc }}</span>
                </div>
                <span
                  v-else
                  style="color:#64748b;"
                >None</span>
              </span>

              <span class="info-key">Buckets</span>
              <span class="info-val">
                <div
                  v-if="selectedInstance.buckets.length > 0"
                  class="chip-list"
                >
                  <span
                    v-for="b in selectedInstance.buckets"
                    :key="b"
                    class="chip"
                  >{{ b }}</span>
                </div>
                <span
                  v-else
                  style="color:#64748b;"
                >None</span>
              </span>
            </div>
          </div>
        </div>

        <!-- Sessions tab -->
        <div
          v-else-if="activeTab === 'sessions'"
          class="supascan-content"
        >
          <div
            v-if="!selectedInstance"
            class="empty-state"
          >
            <i class="fas fa-users" />
            <span>Select an instance to manage its sessions</span>
          </div>
          <div
            v-else
            class="sessions-panel"
          >
            <div class="signup-title">
              <i class="fas fa-users" /> Sessions for {{ selectedInstance.projectRef }}
            </div>
            <span style="font-size:11px;color:#64748b;">Choose which identity all checks run as. Sessions belong to this instance only.</span>

            <!-- Identity selector -->
            <div class="session-list">
              <label
                class="session-row"
                :class="{ 'session-row--active': !selectedInstance.activeSessionId }"
              >
                <input
                  type="radio"
                  :checked="!selectedInstance.activeSessionId"
                  @change="useAnon"
                >
                <span class="session-id">
                  <i class="fas fa-user-secret" /> Anonymous
                  <span style="color:#64748b;">(anon key)</span>
                </span>
              </label>

              <label
                v-for="user in instanceSessions"
                :key="user.id"
                class="session-row"
                :class="{ 'session-row--active': selectedInstance.activeSessionId === user.id }"
              >
                <input
                  type="radio"
                  :checked="selectedInstance.activeSessionId === user.id"
                  @change="useSession(user.id)"
                >
                <span class="session-id">
                  <i class="fas fa-user" /> {{ user.email }}
                  <span class="session-source">{{ user.source }}</span>
                </span>
                <button
                  class="supascan-btn supascan-btn-danger"
                  style="font-size:10px;padding:1px 6px;"
                  title="Remove this session"
                  @click.prevent="removeUser(user.id)"
                >
                  <i class="fas fa-trash" />
                </button>
              </label>

              <div
                v-if="instanceSessions.length === 0"
                style="font-size:11px;color:#64748b;padding:6px 2px;"
              >
                No users yet — sign in below or create one from the Signup tab.
              </div>
            </div>

            <!-- Add existing user via sign-in -->
            <div class="session-add">
              <div class="session-add-title">
                <i class="fas fa-right-to-bracket" /> Add existing user (sign in)
              </div>
              <div class="settings-row">
                <label class="settings-label">Email</label>
                <input
                  v-model="signInEmail"
                  type="text"
                  class="settings-input"
                  placeholder="user@example.com"
                >
              </div>
              <div class="settings-row">
                <label class="settings-label">Password</label>
                <input
                  v-model="signInPassword"
                  type="text"
                  class="settings-input"
                  placeholder="password"
                >
              </div>
              <button
                class="supascan-btn supascan-btn-primary"
                :disabled="!selectedHasCreds || !signInEmail || sessionBusy"
                @click="addSignIn"
              >
                <i :class="sessionBusy ? 'fas fa-spinner fa-spin' : 'fas fa-right-to-bracket'" />
                Sign in &amp; add
              </button>
            </div>

            <!-- Add user via raw token -->
            <div class="session-add">
              <div class="session-add-title">
                <i class="fas fa-key" /> Add by access token
              </div>
              <div class="settings-row">
                <label class="settings-label">Label / email</label>
                <input
                  v-model="tokenLabel"
                  type="text"
                  class="settings-input"
                  placeholder="user@example.com"
                >
              </div>
              <div class="settings-row">
                <label class="settings-label">Access token (JWT)</label>
                <input
                  v-model="tokenValue"
                  type="text"
                  class="settings-input"
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                >
              </div>
              <button
                class="supascan-btn"
                :disabled="!tokenLabel || !tokenValue || sessionBusy"
                @click="addToken"
              >
                <i class="fas fa-plus" /> Add token
              </button>
            </div>

            <div
              v-if="sessionError"
              style="color:#ef4444;font-size:12px;"
            >
              <i class="fas fa-triangle-exclamation" /> {{ sessionError }}
            </div>
          </div>
        </div>

        <!-- Custom signup tab -->
        <div
          v-else-if="activeTab === 'signup'"
          class="supascan-content"
        >
          <div
            v-if="!selectedInstance"
            class="empty-state"
          >
            <i class="fas fa-user-plus" />
            <span>Select an instance to run a custom signup</span>
          </div>
          <div
            v-else
            class="signup-panel"
          >
            <div class="signup-title">
              <i class="fas fa-user-plus" /> Custom Signup
              <span style="font-size:11px;color:#64748b;font-weight:400;">POST {{ selectedInstance.projectUrl }}/auth/v1/signup</span>
            </div>

            <div class="settings-row">
              <label class="settings-label">Email</label>
              <input
                v-model="signupEmail"
                type="text"
                class="settings-input"
                placeholder="user@example.com"
              >
            </div>

            <div class="settings-row">
              <label class="settings-label">Password</label>
              <input
                v-model="signupPassword"
                type="text"
                class="settings-input"
                placeholder="Password123!"
              >
            </div>

            <div class="settings-row">
              <label class="settings-label">Extra data (JSON, optional)</label>
              <textarea
                v-model="signupData"
                class="settings-input"
                rows="3"
                placeholder="{ &quot;full_name&quot;: &quot;Test User&quot; }"
                style="font-family:ui-monospace,monospace;resize:vertical;"
              />
              <span style="font-size:11px;color:#64748b;">Sent as the <code>data</code> object (user metadata) in the signup body.</span>
            </div>

            <button
              class="supascan-btn supascan-btn-primary"
              :disabled="!selectedHasCreds || !signupEmail || signupRunning"
              @click="runCustomSignup"
            >
              <i
                :class="signupRunning ? 'fas fa-spinner fa-spin' : 'fas fa-paper-plane'"
              />
              Send Signup
            </button>

            <span
              v-if="!selectedHasCreds"
              style="font-size:11px;color:#f59e0b;"
            >No credentials for this instance — add an anon key or a session to enable signup.</span>

            <div
              v-if="signupResult"
              class="signup-result"
            >
              <div class="signup-result-head">
                <span
                  :class="signupResult.hasToken ? 'status-pill status-rows' : 'status-pill status-untested'"
                >
                  {{ signupResult.statusCode ?? "ERR" }}
                </span>
                <span
                  v-if="signupResult.hasToken"
                  style="color:#f87171;font-weight:700;"
                ><i class="fas fa-triangle-exclamation" /> Instant session returned (open signup)</span>
                <span
                  v-else-if="signupResult.statusCode && signupResult.statusCode < 300"
                  style="color:#3ecf8e;"
                >Accepted (no instant token — may need email confirmation)</span>
                <span
                  v-else
                  style="color:#8892a4;"
                >Rejected</span>
                <button
                  v-if="signupResult.body"
                  class="supascan-btn"
                  style="font-size:10px;padding:1px 6px;margin-left:auto;"
                  title="Copy response body"
                  @click="copyText(signupResult.body)"
                >
                  <i class="fas fa-copy" /> Copy response
                </button>
              </div>
              <div
                v-if="signupResult.sessionSet"
                class="signup-session-note"
              >
                <i class="fas fa-circle-check" />
                Session captured — all checks (read, write, storage, RPC) now run as
                <strong>{{ signupEmail }}</strong> instead of anon.
              </div>
              <pre class="signup-body">{{ signupResult.body }}</pre>
            </div>
          </div>
        </div>

        <!-- Activity log tab -->
        <div
          v-else-if="activeTab === 'log'"
          class="supascan-content"
          style="padding:0;"
        >
          <ActivityLogContainer
            :entries="activityEntries"
            @clear="onClearLog"
          />
        </div>

        <!-- Settings tab -->
        <div
          v-else-if="activeTab === 'settings'"
          class="supascan-content"
        >
          <div class="settings-panel">
            <div style="font-weight:700;margin-bottom:16px;color:#3ecf8e;">
              <i class="fas fa-gear" /> SupaScan Settings
            </div>

            <div class="settings-row">
              <label class="settings-label">Max Requests / Second</label>
              <input
                v-model.number="draftSettings.maxRequestsPerSecond"
                type="number"
                min="1"
                max="20"
                class="settings-input"
              >
            </div>

            <div class="settings-row">
              <label class="settings-label">Max Concurrency</label>
              <input
                v-model.number="draftSettings.maxConcurrency"
                type="number"
                min="1"
                max="10"
                class="settings-input"
              >
            </div>

            <div class="settings-row">
              <label class="settings-label">Test Email (auth signup check)</label>
              <input
                v-model="draftSettings.testEmail"
                type="text"
                class="settings-input"
                placeholder="supascan.probe@example.com"
              >
              <span style="font-size:11px;color:#64748b;">Full email used for the open-signup test. Tip: include <code>{rand}</code> (e.g. <code>you+{rand}@example.com</code>) for a unique address each run.</span>
            </div>

            <div class="settings-row">
              <label class="settings-label">Discovery wordlist source</label>
              <div class="wordlist-switch">
                <button
                  class="wordlist-opt"
                  :class="{ active: !draftSettings.useCustomWordlist }"
                  @click="draftSettings.useCustomWordlist = false"
                >
                  Default (~65 tables)
                </button>
                <button
                  class="wordlist-opt"
                  :class="{ active: draftSettings.useCustomWordlist }"
                  @click="draftSettings.useCustomWordlist = true"
                >
                  Custom wordlist
                </button>
              </div>
            </div>

            <div class="settings-row">
              <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;">
                <label class="settings-label">Custom table wordlist</label>
                <button
                  class="supascan-btn"
                  style="font-size:11px;padding:2px 8px;"
                  :disabled="!draftSettings.useCustomWordlist"
                  @click="triggerWordlistFile"
                >
                  <i class="fas fa-file-arrow-up" /> Load from file
                </button>
              </div>
              <input
                ref="wordlistFileInput"
                type="file"
                accept=".txt,.lst,.csv,text/plain"
                style="display:none;"
                @change="onWordlistFile"
              >
              <textarea
                v-model="draftSettings.tableWordlist"
                class="settings-input"
                rows="6"
                placeholder="users&#10;profiles&#10;orders&#10;..."
                style="font-family:ui-monospace,monospace;resize:vertical;"
                :disabled="!draftSettings.useCustomWordlist"
              />
              <span style="font-size:11px;color:#64748b;">One table name per line (commas also allowed). Active only when <strong>Custom wordlist</strong> is selected above and discovery is enabled.</span>
            </div>

            <div class="settings-row">
              <label class="settings-toggle">
                <input
                  v-model="draftSettings.redactEvidence"
                  type="checkbox"
                >
                <span
                  class="settings-label"
                  style="margin:0;"
                >Redact Evidence (mask keys in logs)</span>
              </label>
            </div>

            <button
              class="supascan-btn supascan-btn-primary"
              @click="saveSettings"
            >
              <i class="fas fa-floppy-disk" /> Save Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted, onUnmounted, type Ref } from "vue";
import type { FrontendSDK } from "../../index";
import type { SupabaseInstance, ActivityEntry, PluginSettings, TableState, SessionUser } from "backend";
import { InstanceListContainer } from "../InstanceList";
import { TableGridContainer } from "../TableGrid";
import { StorageGridContainer } from "../StorageGrid";
import { RpcGridContainer } from "../RpcGrid";
import { RolesGridContainer } from "../RolesGrid";
import { ActivityLogContainer } from "../ActivityLog";

export default defineComponent({
  name: "SupaScanContainer",
  components: {
    InstanceListContainer,
    TableGridContainer,
    StorageGridContainer,
    RpcGridContainer,
    RolesGridContainer,
    ActivityLogContainer,
  },
  props: {
    sdk: {
      type: Object as () => FrontendSDK,
      required: true,
    },
  },
  setup(props) {
    const sdk = props.sdk;
    const instances: Ref<SupabaseInstance[]> = ref([]);
    const activityEntries: Ref<ActivityEntry[]> = ref([]);
    const selectedRef: Ref<string | null> = ref(null);
    const activeTab = ref<
      "tables" | "storage" | "rpc" | "roles" | "info" | "sessions" | "signup" | "log" | "settings"
    >("tables");
    const isRunning = ref(false);
    const progressMessages: Ref<string[]> = ref([]);

    const showAddModal = ref(false);
    const manualUrl = ref("");
    const manualAnonKey = ref("");
    const manualError = ref("");

    const signupEmail = ref("");
    const signupPassword = ref("Password123!");
    const signupData = ref("");
    const signupRunning = ref(false);
    const signupResult: Ref<
      { statusCode?: number; body?: string; hasToken?: boolean; sessionSet?: boolean } | null
    > = ref(null);

    const signInEmail = ref("");
    const signInPassword = ref("");
    const tokenLabel = ref("");
    const tokenValue = ref("");
    const sessionBusy = ref(false);
    const sessionError = ref("");

    const draftSettings: Ref<PluginSettings> = ref({
      maxRequestsPerSecond: 5,
      maxConcurrency: 3,
      redactEvidence: false,
      testEmail: "supascan.probe@example.com",
      tableWordlist: "",
      useCustomWordlist: false,
      discoveryEnabled: true,
    });

    const wordlistFileInput = ref<HTMLInputElement | null>(null);

    const selectedInstance = computed<SupabaseInstance | null>(() => {
      if (!selectedRef.value) return null;
      return instances.value.find((i) => i.projectRef === selectedRef.value) ?? null;
    });

    const selectedTables = computed<TableState[]>(() => {
      if (!selectedInstance.value) return [];
      return Object.values(selectedInstance.value.tables);
    });

    const instanceSessions = computed<SessionUser[]>(() => selectedInstance.value?.sessions ?? []);

    const activeUser = computed<SessionUser | null>(() => {
      const inst = selectedInstance.value;
      if (!inst || !inst.activeSessionId) return null;
      return (inst.sessions ?? []).find((s) => s.id === inst.activeSessionId) ?? null;
    });

    const hasServiceRoleLeak = computed(() => instances.value.some((i) => i.serviceRoleLeak));
    const hasCreds = (inst: SupabaseInstance | null): boolean =>
      !!inst && (!!inst.anonKey || (inst.sessions?.length ?? 0) > 0);

    const selectedHasCreds = computed(() => hasCreds(selectedInstance.value));

    const canProbe = computed(
      () => hasCreds(selectedInstance.value) && !isRunning.value
    );

    function onSelectInstance(ref: string) {
      selectedRef.value = ref;
      activeTab.value = "tables";
    }

    async function copyKey(key: string) {
      try {
        await navigator.clipboard.writeText(key);
        sdk.window.showToast("Anon key copied to clipboard", { variant: "success" });
      } catch {
        sdk.window.showToast("Copy failed — select and copy manually", { variant: "error" });
      }
    }

    async function copyText(text: string) {
      try {
        await navigator.clipboard.writeText(text);
        sdk.window.showToast("Copied to clipboard", { variant: "success" });
      } catch {
        sdk.window.showToast("Copy failed — select and copy manually", { variant: "error" });
      }
    }

    function addProgress(msg: string) {
      progressMessages.value.push(msg);
      if (progressMessages.value.length > 20) {
        progressMessages.value = progressMessages.value.slice(-20);
      }
    }

    function openAddModal() {
      manualError.value = "";
      const hint = (window as unknown as Record<string, string>)["__supascan_prefill_host"];
      if (hint !== undefined) {
        manualUrl.value = hint.includes("supabase.co") ? `https://${hint}` : "";
        delete (window as unknown as Record<string, string>)["__supascan_prefill_host"];
      }
      showAddModal.value = true;
    }

    async function submitManual() {
      manualError.value = "";
      const result = await sdk.backend.addManualInstance(manualUrl.value, manualAnonKey.value);
      if (!result.ok) {
        manualError.value = result.error ?? "Unknown error";
        return;
      }
      showAddModal.value = false;
      manualUrl.value = "";
      manualAnonKey.value = "";
      sdk.window.showToast("Instance added", { variant: "success" });
    }

    async function runCustomSignup() {
      if (!selectedRef.value) return;
      signupRunning.value = true;
      signupResult.value = null;
      try {
        const res = await sdk.backend.customSignup(
          selectedRef.value,
          signupEmail.value,
          signupPassword.value,
          signupData.value
        );
        if (!res.ok) {
          sdk.window.showToast(res.error ?? "Signup failed", { variant: "error" });
          signupResult.value = { statusCode: res.statusCode, body: res.error };
          return;
        }
        signupResult.value = {
          statusCode: res.statusCode,
          body: res.body,
          hasToken: res.hasToken,
          sessionSet: res.sessionSet,
        };
        if (res.sessionSet) {
          sdk.window.showToast("Session captured — checks now run as this user", {
            variant: "success",
          });
        }
      } finally {
        signupRunning.value = false;
      }
    }

    async function useAnon() {
      if (!selectedRef.value) return;
      await sdk.backend.setActiveSession(selectedRef.value, "");
    }

    async function useSession(sessionId: string) {
      if (!selectedRef.value) return;
      await sdk.backend.setActiveSession(selectedRef.value, sessionId);
    }

    async function removeUser(sessionId: string) {
      if (!selectedRef.value) return;
      await sdk.backend.removeSession(selectedRef.value, sessionId);
    }

    async function addSignIn() {
      if (!selectedRef.value) return;
      sessionError.value = "";
      sessionBusy.value = true;
      try {
        const res = await sdk.backend.signInUser(
          selectedRef.value,
          signInEmail.value,
          signInPassword.value
        );
        if (!res.ok) {
          sessionError.value = res.error ?? "Sign-in failed.";
          return;
        }
        if (!res.added) {
          sessionError.value = `Sign-in did not return a token (status ${res.statusCode ?? "?"}). Check credentials.`;
          return;
        }
        signInEmail.value = "";
        signInPassword.value = "";
        sdk.window.showToast("User signed in and set as active session", { variant: "success" });
      } finally {
        sessionBusy.value = false;
      }
    }

    async function addToken() {
      if (!selectedRef.value) return;
      sessionError.value = "";
      sessionBusy.value = true;
      try {
        const res = await sdk.backend.addSessionToken(
          selectedRef.value,
          tokenLabel.value,
          tokenValue.value
        );
        if (!res.ok) {
          sessionError.value = res.error ?? "Could not add token.";
          return;
        }
        tokenLabel.value = "";
        tokenValue.value = "";
        sdk.window.showToast("Token added and set as active session", { variant: "success" });
      } finally {
        sessionBusy.value = false;
      }
    }

    async function runRead() {
      if (!selectedRef.value) return;
      isRunning.value = true;
      progressMessages.value = [];
      try {
        await sdk.backend.runReadChecks(selectedRef.value);
      } finally {
        isRunning.value = false;
      }
    }

    async function runWrite() {
      if (!selectedRef.value) return;
      isRunning.value = true;
      progressMessages.value = [];
      try {
        await sdk.backend.runWriteProbes(selectedRef.value);
      } finally {
        isRunning.value = false;
      }
    }

    async function runAuth() {
      if (!selectedRef.value) return;
      isRunning.value = true;
      progressMessages.value = [];
      try {
        await sdk.backend.runAuthCheck(selectedRef.value);
      } finally {
        isRunning.value = false;
      }
    }

    async function runRpc() {
      if (!selectedRef.value) return;
      isRunning.value = true;
      progressMessages.value = [];
      try {
        await sdk.backend.runRpcCheck(selectedRef.value);
      } finally {
        isRunning.value = false;
      }
    }

    async function runIdor() {
      if (!selectedRef.value) return;
      isRunning.value = true;
      progressMessages.value = [];
      try {
        await sdk.backend.runIdorCheck(selectedRef.value);
      } finally {
        isRunning.value = false;
      }
    }

    async function runRole() {
      if (!selectedRef.value) return;
      isRunning.value = true;
      progressMessages.value = [];
      try {
        await sdk.backend.runRoleCheck(selectedRef.value);
      } finally {
        isRunning.value = false;
      }
    }

    async function persistDiscovery() {
      await sdk.backend.saveSettings(draftSettings.value);
    }

    async function stopAll() {
      await sdk.backend.stopAllChecks();
      isRunning.value = false;
    }

    async function onClearLog() {
      await sdk.backend.clearActivityLog();
      activityEntries.value = [];
    }

    async function saveSettings() {
      await sdk.backend.saveSettings(draftSettings.value);
      sdk.window.showToast("Settings saved", { variant: "success" });
    }

    function triggerWordlistFile() {
      wordlistFileInput.value?.click();
    }

    function onWordlistFile(event: Event) {
      const input = event.target as HTMLInputElement;
      const file = input.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        draftSettings.value.tableWordlist = String(reader.result ?? "");
        const count = draftSettings.value.tableWordlist
          .split(/[\n,]/)
          .map((t) => t.trim())
          .filter((t) => t.length > 0).length;
        sdk.window.showToast(`Loaded ${count} table names from ${file.name}`, { variant: "success" });
      };
      reader.onerror = () => {
        sdk.window.showToast("Could not read file", { variant: "error" });
      };
      reader.readAsText(file);
      input.value = "";
    }

    async function loadData() {
      const [insts, settings, log] = await Promise.all([
        sdk.backend.getInstances(),
        sdk.backend.getSettings(),
        sdk.backend.getActivityLog(),
      ]);
      instances.value = insts;
      draftSettings.value = settings;
      activityEntries.value = log;
    }

    let unsubInstances: (() => void) | undefined;
    let unsubActivity: (() => void) | undefined;
    let unsubProgress: (() => void) | undefined;

    onMounted(async () => {
      await loadData();

      unsubInstances = sdk.backend.onEvent("supascan:instances-updated", (data) => {
        instances.value = data.instances;
      });

      unsubActivity = sdk.backend.onEvent("supascan:activity-updated", (data) => {
        activityEntries.value = data.entries;
      });

      unsubProgress = sdk.backend.onEvent("supascan:check-progress", (data) => {
        addProgress(data.message);
        if (data.message.includes("complete") || data.message.includes("Stopped")) {
          isRunning.value = false;
        }
      });
    });

    onUnmounted(() => {
      unsubInstances?.();
      unsubActivity?.();
      unsubProgress?.();
    });

    return {
      instances,
      activityEntries,
      selectedRef,
      selectedInstance,
      selectedTables,
      instanceSessions,
      activeUser,
      hasServiceRoleLeak,
      activeTab,
      isRunning,
      progressMessages,
      draftSettings,
      canProbe,
      selectedHasCreds,
      showAddModal,
      manualUrl,
      manualAnonKey,
      manualError,
      signupEmail,
      signupPassword,
      signupData,
      signupRunning,
      signupResult,
      signInEmail,
      signInPassword,
      tokenLabel,
      tokenValue,
      sessionBusy,
      sessionError,
      onSelectInstance,
      copyKey,
      copyText,
      openAddModal,
      submitManual,
      runCustomSignup,
      useAnon,
      useSession,
      removeUser,
      addSignIn,
      addToken,
      runRead,
      runWrite,
      runAuth,
      runRpc,
      runIdor,
      runRole,
      persistDiscovery,
      stopAll,
      onClearLog,
      saveSettings,
      wordlistFileInput,
      triggerWordlistFile,
      onWordlistFile,
    };
  },
});
</script>
