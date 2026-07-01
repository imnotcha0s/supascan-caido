# SupaScan

SupaScan is a [Caido](https://caido.io) plugin that passively fingerprints Supabase backends in proxied traffic and runs safe checks for common Supabase misconfigurations. 

## Overview

As you browse a target through Caido, SupaScan watches the proxied traffic, detects Supabase usage, extracts credentials, and surfaces Row Level Security, authentication, storage, RPC, and privilege escalation problems as native Caido Findings, each with reproducible evidence and remediation SQL.

The plugin is passive by default. No request is ever sent on your behalf until you explicitly click a check, and only when the target host is inside your Caido scope.

## Features

Passive detection

* Fingerprints Supabase from host patterns, API paths, request headers, and JavaScript bundles
* Extracts the project URL, the anon key, and the anon role
* Detects any leaked service_role key in responses or bundles and reports it as a critical Finding.
* Captures observed tables, RPC functions, and storage buckets from traffic

Session manager

* Add authenticated users per instance by signing in with email and password, or by pasting an existing access token
* Users created through the Signup tab are added automatically
* Works with only a session and no anon key, since Supabase accepts any project token as the api key

Active checks (explicit, gated by instance)

* Read: tests each table with a single row request and a count only request, records the row count as impact, and keeps one sampled row as evidence
* Write: targets one real row and sets a column to its own value, so nothing is semantically modified, then reports whether the write was permitted
* Auth: tests open signup, and provides a custom signup tab with optional user metadata
* RPC: enumerates functions from the OpenAPI schema, tests unauthenticated calls, and offers a name brute force with hint following
* Storage: enumerates objects inside buckets recursively to find exposed files, with copy url, download, and send to Repeater per file
* Databases: brute forces privileged PostgREST schemas (auth, vault, storage, and more) to find privilege escalation, tested as the active role
* IDOR and RLS: diffs what two or more users can read to catch broken policies, not just absent ones

## Requirements

* Node.js 18 or newer
* pnpm

## Build

```bash
pnpm install
pnpm build
```

The build produces an installable plugin package at `dist/plugin_package.zip`.

For live development with hot reload:

```bash
pnpm watch
```

## Install in Caido

1. Open Caido
2. Go to Plugins
3. Choose Install from file
4. Select `dist/plugin_package.zip`

## Usage

1. Add the target host to your Caido scope
2. Browse the target application through Caido. SupaScan detects Supabase instances passively and lists them in the SupaScan panel
3. Optionally open the Sessions tab and add a user by sign in or by token
4. Select an instance and run the checks you need: Read, Write, Auth, RPC, Databases, or IDOR and RLS
5. Review Findings in Caido's native Findings view, and inspect results in the SupaScan tabs

## Disclaimer

SupaScan is for authorized security testing only. Use it exclusively on systems you own or have explicit permission to test. You are responsible for how you use it.

Keep that in mind when performing your audits: https://supabase.com/docs/guides/security/security-testing