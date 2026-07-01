/**
* @vue/shared v3.5.39
* (c) 2018-present Yuxi (Evan) You and Vue contributors
* @license MIT
**/
// @__NO_SIDE_EFFECTS__
function en(e) {
  const t = /* @__PURE__ */ Object.create(null);
  for (const s of e.split(",")) t[s] = 1;
  return (s) => s in t;
}
const se = {}, kt = [], We = () => {
}, ii = () => !1, ys = (e) => e.charCodeAt(0) === 111 && e.charCodeAt(1) === 110 && // uppercase letter
(e.charCodeAt(2) > 122 || e.charCodeAt(2) < 97), vs = (e) => e.startsWith("onUpdate:"), pe = Object.assign, tn = (e, t) => {
  const s = e.indexOf(t);
  s > -1 && e.splice(s, 1);
}, uo = Object.prototype.hasOwnProperty, Y = (e, t) => uo.call(e, t), F = Array.isArray, Tt = (e) => Jt(e) === "[object Map]", ms = (e) => Jt(e) === "[object Set]", Sn = (e) => Jt(e) === "[object Date]", N = (e) => typeof e == "function", re = (e) => typeof e == "string", Be = (e) => typeof e == "symbol", te = (e) => e !== null && typeof e == "object", oi = (e) => (te(e) || N(e)) && N(e.then) && N(e.catch), li = Object.prototype.toString, Jt = (e) => li.call(e), co = (e) => Jt(e).slice(8, -1), ri = (e) => Jt(e) === "[object Object]", sn = (e) => re(e) && e !== "NaN" && e[0] !== "-" && "" + parseInt(e, 10) === e, Ft = /* @__PURE__ */ en(
  // the leading comma is intentional so empty string "" is also included
  ",key,ref,ref_for,ref_key,onVnodeBeforeMount,onVnodeMounted,onVnodeBeforeUpdate,onVnodeUpdated,onVnodeBeforeUnmount,onVnodeUnmounted"
), ws = (e) => {
  const t = /* @__PURE__ */ Object.create(null);
  return (s) => t[s] || (t[s] = e(s));
}, fo = /-\w/g, we = ws(
  (e) => e.replace(fo, (t) => t.slice(1).toUpperCase())
), po = /\B([A-Z])/g, ot = ws(
  (e) => e.replace(po, "-$1").toLowerCase()
), Cs = ws((e) => e.charAt(0).toUpperCase() + e.slice(1)), Os = ws(
  (e) => e ? `on${Cs(e)}` : ""
), Ve = (e, t) => !Object.is(e, t), ls = (e, ...t) => {
  for (let s = 0; s < e.length; s++)
    e[s](...t);
}, ai = (e, t, s, n = !1) => {
  Object.defineProperty(e, t, {
    configurable: !0,
    enumerable: !1,
    writable: n,
    value: s
  });
}, nn = (e) => {
  const t = parseFloat(e);
  return isNaN(t) ? e : t;
};
let kn;
const Ss = () => kn || (kn = typeof globalThis < "u" ? globalThis : typeof self < "u" ? self : typeof window < "u" ? window : typeof global < "u" ? global : {});
function Yt(e) {
  if (F(e)) {
    const t = {};
    for (let s = 0; s < e.length; s++) {
      const n = e[s], i = re(n) ? yo(n) : Yt(n);
      if (i)
        for (const l in i)
          t[l] = i[l];
    }
    return t;
  } else if (re(e) || te(e))
    return e;
}
const ho = /;(?![^(]*\))/g, go = /:([^]+)/, bo = /\/\*[^]*?\*\//g;
function yo(e) {
  const t = {};
  return e.replace(bo, "").split(ho).forEach((s) => {
    if (s) {
      const n = s.split(go);
      n.length > 1 && (t[n[0].trim()] = n[1].trim());
    }
  }), t;
}
function ee(e) {
  let t = "";
  if (re(e))
    t = e;
  else if (F(e))
    for (let s = 0; s < e.length; s++) {
      const n = ee(e[s]);
      n && (t += n + " ");
    }
  else if (te(e))
    for (const s in e)
      e[s] && (t += s + " ");
  return t.trim();
}
const vo = "itemscope,allowfullscreen,formnovalidate,ismap,nomodule,novalidate,readonly", mo = /* @__PURE__ */ en(vo);
function ui(e) {
  return !!e || e === "";
}
function wo(e, t) {
  if (e.length !== t.length) return !1;
  let s = !0;
  for (let n = 0; s && n < e.length; n++)
    s = Xt(e[n], t[n]);
  return s;
}
function Xt(e, t) {
  if (e === t) return !0;
  let s = Sn(e), n = Sn(t);
  if (s || n)
    return s && n ? e.getTime() === t.getTime() : !1;
  if (s = Be(e), n = Be(t), s || n)
    return e === t;
  if (s = F(e), n = F(t), s || n)
    return s && n ? wo(e, t) : !1;
  if (s = te(e), n = te(t), s || n) {
    if (!s || !n)
      return !1;
    const i = Object.keys(e).length, l = Object.keys(t).length;
    if (i !== l)
      return !1;
    for (const o in e) {
      const a = e.hasOwnProperty(o), u = t.hasOwnProperty(o);
      if (a && !u || !a && u || !Xt(e[o], t[o]))
        return !1;
    }
  }
  return String(e) === String(t);
}
function ci(e, t) {
  return e.findIndex((s) => Xt(s, t));
}
const fi = (e) => !!(e && e.__v_isRef === !0), M = (e) => re(e) ? e : e == null ? "" : F(e) || te(e) && (e.toString === li || !N(e.toString)) ? fi(e) ? M(e.value) : JSON.stringify(e, di, 2) : String(e), di = (e, t) => fi(t) ? di(e, t.value) : Tt(t) ? {
  [`Map(${t.size})`]: [...t.entries()].reduce(
    (s, [n, i], l) => (s[Ps(n, l) + " =>"] = i, s),
    {}
  )
} : ms(t) ? {
  [`Set(${t.size})`]: [...t.values()].map((s) => Ps(s))
} : Be(t) ? Ps(t) : te(t) && !F(t) && !ri(t) ? String(t) : t, Ps = (e, t = "") => {
  var s;
  return (
    // Symbol.description in es2019+ so we need to cast here to pass
    // the lib: es2016 check
    Be(e) ? `Symbol(${(s = e.description) != null ? s : t})` : e
  );
};
/**
* @vue/reactivity v3.5.39
* (c) 2018-present Yuxi (Evan) You and Vue contributors
* @license MIT
**/
let de;
class Co {
  // TODO isolatedDeclarations "__v_skip"
  constructor(t = !1) {
    this.detached = t, this._active = !0, this._on = 0, this.effects = [], this.cleanups = [], this._isPaused = !1, this._warnOnRun = !0, this.__v_skip = !0, !t && de && (de.active ? (this.parent = de, this.index = (de.scopes || (de.scopes = [])).push(
      this
    ) - 1) : (this._active = !1, this._warnOnRun = !1));
  }
  get active() {
    return this._active;
  }
  pause() {
    if (this._active) {
      this._isPaused = !0;
      let t, s;
      if (this.scopes)
        for (t = 0, s = this.scopes.length; t < s; t++)
          this.scopes[t].pause();
      for (t = 0, s = this.effects.length; t < s; t++)
        this.effects[t].pause();
    }
  }
  /**
   * Resumes the effect scope, including all child scopes and effects.
   */
  resume() {
    if (this._active && this._isPaused) {
      this._isPaused = !1;
      let t, s;
      if (this.scopes)
        for (t = 0, s = this.scopes.length; t < s; t++)
          this.scopes[t].resume();
      for (t = 0, s = this.effects.length; t < s; t++)
        this.effects[t].resume();
    }
  }
  run(t) {
    if (this._active) {
      const s = de;
      try {
        return de = this, t();
      } finally {
        de = s;
      }
    }
  }
  /**
   * This should only be called on non-detached scopes
   * @internal
   */
  on() {
    ++this._on === 1 && (this.prevScope = de, de = this);
  }
  /**
   * This should only be called on non-detached scopes
   * @internal
   */
  off() {
    if (this._on > 0 && --this._on === 0) {
      if (de === this)
        de = this.prevScope;
      else {
        let t = de;
        for (; t; ) {
          if (t.prevScope === this) {
            t.prevScope = this.prevScope;
            break;
          }
          t = t.prevScope;
        }
      }
      this.prevScope = void 0;
    }
  }
  stop(t) {
    if (this._active) {
      this._active = !1;
      let s, n;
      for (s = 0, n = this.effects.length; s < n; s++)
        this.effects[s].stop();
      for (this.effects.length = 0, s = 0, n = this.cleanups.length; s < n; s++)
        this.cleanups[s]();
      if (this.cleanups.length = 0, this.scopes) {
        for (s = 0, n = this.scopes.length; s < n; s++)
          this.scopes[s].stop(!0);
        this.scopes.length = 0;
      }
      if (!this.detached && this.parent && !t) {
        const i = this.parent.scopes.pop();
        i && i !== this && (this.parent.scopes[this.index] = i, i.index = this.index);
      }
      this.parent = void 0;
    }
  }
}
function So() {
  return de;
}
let ne;
const xs = /* @__PURE__ */ new WeakSet();
class pi {
  constructor(t) {
    this.fn = t, this.deps = void 0, this.depsTail = void 0, this.flags = 5, this.next = void 0, this.cleanup = void 0, this.scheduler = void 0, de && (de.active ? de.effects.push(this) : this.flags &= -2);
  }
  pause() {
    this.flags |= 64;
  }
  resume() {
    this.flags & 64 && (this.flags &= -65, xs.has(this) && (xs.delete(this), this.trigger()));
  }
  /**
   * @internal
   */
  notify() {
    this.flags & 2 && !(this.flags & 32) || this.flags & 8 || gi(this);
  }
  run() {
    if (!(this.flags & 1))
      return this.fn();
    this.flags |= 2, Tn(this), bi(this);
    const t = ne, s = Pe;
    ne = this, Pe = !0;
    try {
      return this.fn();
    } finally {
      yi(this), ne = t, Pe = s, this.flags &= -3;
    }
  }
  stop() {
    if (this.flags & 1) {
      for (let t = this.deps; t; t = t.nextDep)
        rn(t);
      this.deps = this.depsTail = void 0, Tn(this), this.onStop && this.onStop(), this.flags &= -2;
    }
  }
  trigger() {
    this.flags & 64 ? xs.add(this) : this.scheduler ? this.scheduler() : this.runIfDirty();
  }
  /**
   * @internal
   */
  runIfDirty() {
    Vs(this) && this.run();
  }
  get dirty() {
    return Vs(this);
  }
}
let hi = 0, Ut, Dt;
function gi(e, t = !1) {
  if (e.flags |= 8, t) {
    e.next = Dt, Dt = e;
    return;
  }
  e.next = Ut, Ut = e;
}
function on() {
  hi++;
}
function ln() {
  if (--hi > 0)
    return;
  if (Dt) {
    let t = Dt;
    for (Dt = void 0; t; ) {
      const s = t.next;
      t.next = void 0, t.flags &= -9, t = s;
    }
  }
  let e;
  for (; Ut; ) {
    let t = Ut;
    for (Ut = void 0; t; ) {
      const s = t.next;
      if (t.next = void 0, t.flags &= -9, t.flags & 1)
        try {
          t.trigger();
        } catch (n) {
          e || (e = n);
        }
      t = s;
    }
  }
  if (e) throw e;
}
function bi(e) {
  for (let t = e.deps; t; t = t.nextDep)
    t.version = -1, t.prevActiveLink = t.dep.activeLink, t.dep.activeLink = t;
}
function yi(e) {
  let t, s = e.depsTail, n = s;
  for (; n; ) {
    const i = n.prevDep;
    n.version === -1 ? (n === s && (s = i), rn(n), ko(n)) : t = n, n.dep.activeLink = n.prevActiveLink, n.prevActiveLink = void 0, n = i;
  }
  e.deps = t, e.depsTail = s;
}
function Vs(e) {
  for (let t = e.deps; t; t = t.nextDep)
    if (t.dep.version !== t.version || t.dep.computed && (vi(t.dep.computed) || t.dep.version !== t.version))
      return !0;
  return !!e._dirty;
}
function vi(e) {
  if (e.flags & 4 && !(e.flags & 16) || (e.flags &= -17, e.globalVersion === Wt) || (e.globalVersion = Wt, !e.isSSR && e.flags & 128 && (!e.deps && !e._dirty || !Vs(e))))
    return;
  e.flags |= 2;
  const t = e.dep, s = ne, n = Pe;
  ne = e, Pe = !0;
  try {
    bi(e);
    const i = e.fn(e._value);
    (t.version === 0 || Ve(i, e._value)) && (e.flags |= 128, e._value = i, t.version++);
  } catch (i) {
    throw t.version++, i;
  } finally {
    ne = s, Pe = n, yi(e), e.flags &= -3;
  }
}
function rn(e, t = !1) {
  const { dep: s, prevSub: n, nextSub: i } = e;
  if (n && (n.nextSub = i, e.prevSub = void 0), i && (i.prevSub = n, e.nextSub = void 0), s.subs === e && (s.subs = n, !n && s.computed)) {
    s.computed.flags &= -5;
    for (let l = s.computed.deps; l; l = l.nextDep)
      rn(l, !0);
  }
  !t && !--s.sc && s.map && s.map.delete(s.key);
}
function ko(e) {
  const { prevDep: t, nextDep: s } = e;
  t && (t.nextDep = s, e.prevDep = void 0), s && (s.prevDep = t, e.nextDep = void 0);
}
let Pe = !0;
const mi = [];
function ze() {
  mi.push(Pe), Pe = !1;
}
function qe() {
  const e = mi.pop();
  Pe = e === void 0 ? !0 : e;
}
function Tn(e) {
  const { cleanup: t } = e;
  if (e.cleanup = void 0, t) {
    const s = ne;
    ne = void 0;
    try {
      t();
    } finally {
      ne = s;
    }
  }
}
let Wt = 0;
class To {
  constructor(t, s) {
    this.sub = t, this.dep = s, this.version = s.version, this.nextDep = this.prevDep = this.nextSub = this.prevSub = this.prevActiveLink = void 0;
  }
}
class an {
  // TODO isolatedDeclarations "__v_skip"
  constructor(t) {
    this.computed = t, this.version = 0, this.activeLink = void 0, this.subs = void 0, this.map = void 0, this.key = void 0, this.sc = 0, this.__v_skip = !0;
  }
  track(t) {
    if (!ne || !Pe || ne === this.computed)
      return;
    let s = this.activeLink;
    if (s === void 0 || s.sub !== ne)
      s = this.activeLink = new To(ne, this), ne.deps ? (s.prevDep = ne.depsTail, ne.depsTail.nextDep = s, ne.depsTail = s) : ne.deps = ne.depsTail = s, wi(s);
    else if (s.version === -1 && (s.version = this.version, s.nextDep)) {
      const n = s.nextDep;
      n.prevDep = s.prevDep, s.prevDep && (s.prevDep.nextDep = n), s.prevDep = ne.depsTail, s.nextDep = void 0, ne.depsTail.nextDep = s, ne.depsTail = s, ne.deps === s && (ne.deps = n);
    }
    return s;
  }
  trigger(t) {
    this.version++, Wt++, this.notify(t);
  }
  notify(t) {
    on();
    try {
      for (let s = this.subs; s; s = s.prevSub)
        s.sub.notify() && s.sub.dep.notify();
    } finally {
      ln();
    }
  }
}
function wi(e) {
  if (e.dep.sc++, e.sub.flags & 4) {
    const t = e.dep.computed;
    if (t && !e.dep.subs) {
      t.flags |= 20;
      for (let n = t.deps; n; n = n.nextDep)
        wi(n);
    }
    const s = e.dep.subs;
    s !== e && (e.prevSub = s, s && (s.nextSub = e)), e.dep.subs = e;
  }
}
const Ws = /* @__PURE__ */ new WeakMap(), dt = /* @__PURE__ */ Symbol(
  ""
), Bs = /* @__PURE__ */ Symbol(
  ""
), Bt = /* @__PURE__ */ Symbol(
  ""
);
function he(e, t, s) {
  if (Pe && ne) {
    let n = Ws.get(e);
    n || Ws.set(e, n = /* @__PURE__ */ new Map());
    let i = n.get(s);
    i || (n.set(s, i = new an()), i.map = n, i.key = s), i.track();
  }
}
function Qe(e, t, s, n, i, l) {
  const o = Ws.get(e);
  if (!o) {
    Wt++;
    return;
  }
  const a = (u) => {
    u && u.trigger();
  };
  if (on(), t === "clear")
    o.forEach(a);
  else {
    const u = F(e), f = u && sn(s);
    if (u && s === "length") {
      const d = Number(n);
      o.forEach((g, h) => {
        (h === "length" || h === Bt || !Be(h) && h >= d) && a(g);
      });
    } else
      switch ((s !== void 0 || o.has(void 0)) && a(o.get(s)), f && a(o.get(Bt)), t) {
        case "add":
          u ? f && a(o.get("length")) : (a(o.get(dt)), Tt(e) && a(o.get(Bs)));
          break;
        case "delete":
          u || (a(o.get(dt)), Tt(e) && a(o.get(Bs)));
          break;
        case "set":
          Tt(e) && a(o.get(dt));
          break;
      }
  }
  ln();
}
function wt(e) {
  const t = /* @__PURE__ */ J(e);
  return t === e ? t : (he(t, "iterate", Bt), /* @__PURE__ */ Ee(e) ? t : t.map(je));
}
function ks(e) {
  return he(e = /* @__PURE__ */ J(e), "iterate", Bt), e;
}
function Ne(e, t) {
  return /* @__PURE__ */ tt(e) ? It(/* @__PURE__ */ pt(e) ? je(t) : t) : je(t);
}
const $o = {
  __proto__: null,
  [Symbol.iterator]() {
    return js(this, Symbol.iterator, (e) => Ne(this, e));
  },
  concat(...e) {
    return wt(this).concat(
      ...e.map((t) => F(t) ? wt(t) : t)
    );
  },
  entries() {
    return js(this, "entries", (e) => (e[1] = Ne(this, e[1]), e));
  },
  every(e, t) {
    return Ye(this, "every", e, t, void 0, arguments);
  },
  filter(e, t) {
    return Ye(
      this,
      "filter",
      e,
      t,
      (s) => s.map((n) => Ne(this, n)),
      arguments
    );
  },
  find(e, t) {
    return Ye(
      this,
      "find",
      e,
      t,
      (s) => Ne(this, s),
      arguments
    );
  },
  findIndex(e, t) {
    return Ye(this, "findIndex", e, t, void 0, arguments);
  },
  findLast(e, t) {
    return Ye(
      this,
      "findLast",
      e,
      t,
      (s) => Ne(this, s),
      arguments
    );
  },
  findLastIndex(e, t) {
    return Ye(this, "findLastIndex", e, t, void 0, arguments);
  },
  // flat, flatMap could benefit from ARRAY_ITERATE but are not straight-forward to implement
  forEach(e, t) {
    return Ye(this, "forEach", e, t, void 0, arguments);
  },
  includes(...e) {
    return Ms(this, "includes", e);
  },
  indexOf(...e) {
    return Ms(this, "indexOf", e);
  },
  join(e) {
    return wt(this).join(e);
  },
  // keys() iterator only reads `length`, no optimization required
  lastIndexOf(...e) {
    return Ms(this, "lastIndexOf", e);
  },
  map(e, t) {
    return Ye(this, "map", e, t, void 0, arguments);
  },
  pop() {
    return Pt(this, "pop");
  },
  push(...e) {
    return Pt(this, "push", e);
  },
  reduce(e, ...t) {
    return $n(this, "reduce", e, t);
  },
  reduceRight(e, ...t) {
    return $n(this, "reduceRight", e, t);
  },
  shift() {
    return Pt(this, "shift");
  },
  // slice could use ARRAY_ITERATE but also seems to beg for range tracking
  some(e, t) {
    return Ye(this, "some", e, t, void 0, arguments);
  },
  splice(...e) {
    return Pt(this, "splice", e);
  },
  toReversed() {
    return wt(this).toReversed();
  },
  toSorted(e) {
    return wt(this).toSorted(e);
  },
  toSpliced(...e) {
    return wt(this).toSpliced(...e);
  },
  unshift(...e) {
    return Pt(this, "unshift", e);
  },
  values() {
    return js(this, "values", (e) => Ne(this, e));
  }
};
function js(e, t, s) {
  const n = ks(e), i = n[t]();
  return n !== e && !/* @__PURE__ */ Ee(e) && (i._next = i.next, i.next = () => {
    const l = i._next();
    return l.done || (l.value = s(l.value)), l;
  }), i;
}
const Ro = Array.prototype;
function Ye(e, t, s, n, i, l) {
  const o = ks(e), a = o !== e && !/* @__PURE__ */ Ee(e), u = o[t];
  if (u !== Ro[t]) {
    const g = u.apply(e, l);
    return a ? je(g) : g;
  }
  let f = s;
  o !== e && (a ? f = function(g, h) {
    return s.call(this, Ne(e, g), h, e);
  } : s.length > 2 && (f = function(g, h) {
    return s.call(this, g, h, e);
  }));
  const d = u.call(o, f, n);
  return a && i ? i(d) : d;
}
function $n(e, t, s, n) {
  const i = ks(e), l = i !== e && !/* @__PURE__ */ Ee(e);
  let o = s, a = !1;
  i !== e && (l ? (a = n.length === 0, o = function(f, d, g) {
    return a && (a = !1, f = Ne(e, f)), s.call(this, f, Ne(e, d), g, e);
  }) : s.length > 3 && (o = function(f, d, g) {
    return s.call(this, f, d, g, e);
  }));
  const u = i[t](o, ...n);
  return a ? Ne(e, u) : u;
}
function Ms(e, t, s) {
  const n = /* @__PURE__ */ J(e);
  he(n, "iterate", Bt);
  const i = n[t](...s);
  return (i === -1 || i === !1) && /* @__PURE__ */ dn(s[0]) ? (s[0] = /* @__PURE__ */ J(s[0]), n[t](...s)) : i;
}
function Pt(e, t, s = []) {
  ze(), on();
  const n = (/* @__PURE__ */ J(e))[t].apply(e, s);
  return ln(), qe(), n;
}
const _o = /* @__PURE__ */ en("__proto__,__v_isRef,__isVue"), Ci = new Set(
  /* @__PURE__ */ Object.getOwnPropertyNames(Symbol).filter((e) => e !== "arguments" && e !== "caller").map((e) => Symbol[e]).filter(Be)
);
function Io(e) {
  Be(e) || (e = String(e));
  const t = /* @__PURE__ */ J(this);
  return he(t, "has", e), t.hasOwnProperty(e);
}
class Si {
  constructor(t = !1, s = !1) {
    this._isReadonly = t, this._isShallow = s;
  }
  get(t, s, n) {
    if (s === "__v_skip") return t.__v_skip;
    const i = this._isReadonly, l = this._isShallow;
    if (s === "__v_isReactive")
      return !i;
    if (s === "__v_isReadonly")
      return i;
    if (s === "__v_isShallow")
      return l;
    if (s === "__v_raw")
      return n === (i ? l ? Uo : Ri : l ? $i : Ti).get(t) || // receiver is not the reactive proxy, but has the same prototype
      // this means the receiver is a user proxy of the reactive proxy
      Object.getPrototypeOf(t) === Object.getPrototypeOf(n) ? t : void 0;
    const o = F(t);
    if (!i) {
      let u;
      if (o && (u = $o[s]))
        return u;
      if (s === "hasOwnProperty")
        return Io;
    }
    const a = Reflect.get(
      t,
      s,
      // if this is a proxy wrapping a ref, return methods using the raw ref
      // as receiver so that we don't have to call `toRaw` on the ref in all
      // its class methods
      /* @__PURE__ */ be(t) ? t : n
    );
    if ((Be(s) ? Ci.has(s) : _o(s)) || (i || he(t, "get", s), l))
      return a;
    if (/* @__PURE__ */ be(a)) {
      const u = o && sn(s) ? a : a.value;
      return i && te(u) ? /* @__PURE__ */ qs(u) : u;
    }
    return te(a) ? i ? /* @__PURE__ */ qs(a) : /* @__PURE__ */ cn(a) : a;
  }
}
class ki extends Si {
  constructor(t = !1) {
    super(!1, t);
  }
  set(t, s, n, i) {
    let l = t[s];
    const o = F(t) && sn(s);
    if (!this._isShallow) {
      const f = /* @__PURE__ */ tt(l);
      if (!/* @__PURE__ */ Ee(n) && !/* @__PURE__ */ tt(n) && (l = /* @__PURE__ */ J(l), n = /* @__PURE__ */ J(n)), !o && /* @__PURE__ */ be(l) && !/* @__PURE__ */ be(n))
        return f || (l.value = n), !0;
    }
    const a = o ? Number(s) < t.length : Y(t, s), u = Reflect.set(
      t,
      s,
      n,
      /* @__PURE__ */ be(t) ? t : i
    );
    return t === /* @__PURE__ */ J(i) && u && (a ? Ve(n, l) && Qe(t, "set", s, n) : Qe(t, "add", s, n)), u;
  }
  deleteProperty(t, s) {
    const n = Y(t, s);
    t[s];
    const i = Reflect.deleteProperty(t, s);
    return i && n && Qe(t, "delete", s, void 0), i;
  }
  has(t, s) {
    const n = Reflect.has(t, s);
    return (!Be(s) || !Ci.has(s)) && he(t, "has", s), n;
  }
  ownKeys(t) {
    return he(
      t,
      "iterate",
      F(t) ? "length" : dt
    ), Reflect.ownKeys(t);
  }
}
class Ao extends Si {
  constructor(t = !1) {
    super(!0, t);
  }
  set(t, s) {
    return !0;
  }
  deleteProperty(t, s) {
    return !0;
  }
}
const Eo = /* @__PURE__ */ new ki(), Oo = /* @__PURE__ */ new Ao(), Po = /* @__PURE__ */ new ki(!0);
const zs = (e) => e, ns = (e) => Reflect.getPrototypeOf(e);
function xo(e, t, s) {
  return function(...n) {
    const i = this.__v_raw, l = /* @__PURE__ */ J(i), o = Tt(l), a = e === "entries" || e === Symbol.iterator && o, u = e === "keys" && o, f = i[e](...n), d = s ? zs : t ? It : je;
    return !t && he(
      l,
      "iterate",
      u ? Bs : dt
    ), pe(
      // inheriting all iterator properties
      Object.create(f),
      {
        // iterator protocol
        next() {
          const { value: g, done: h } = f.next();
          return h ? { value: g, done: h } : {
            value: a ? [d(g[0]), d(g[1])] : d(g),
            done: h
          };
        }
      }
    );
  };
}
function is(e) {
  return function(...t) {
    return e === "delete" ? !1 : e === "clear" ? void 0 : this;
  };
}
function jo(e, t) {
  const s = {
    get(i) {
      const l = this.__v_raw, o = /* @__PURE__ */ J(l), a = /* @__PURE__ */ J(i);
      e || (Ve(i, a) && he(o, "get", i), he(o, "get", a));
      const { has: u } = ns(o), f = t ? zs : e ? It : je;
      if (u.call(o, i))
        return f(l.get(i));
      if (u.call(o, a))
        return f(l.get(a));
      l !== o && l.get(i);
    },
    get size() {
      const i = this.__v_raw;
      return !e && he(/* @__PURE__ */ J(i), "iterate", dt), i.size;
    },
    has(i) {
      const l = this.__v_raw, o = /* @__PURE__ */ J(l), a = /* @__PURE__ */ J(i);
      return e || (Ve(i, a) && he(o, "has", i), he(o, "has", a)), i === a ? l.has(i) : l.has(i) || l.has(a);
    },
    forEach(i, l) {
      const o = this, a = o.__v_raw, u = /* @__PURE__ */ J(a), f = t ? zs : e ? It : je;
      return !e && he(u, "iterate", dt), a.forEach((d, g) => i.call(l, f(d), f(g), o));
    }
  };
  return pe(
    s,
    e ? {
      add: is("add"),
      set: is("set"),
      delete: is("delete"),
      clear: is("clear")
    } : {
      add(i) {
        const l = /* @__PURE__ */ J(this), o = ns(l), a = /* @__PURE__ */ J(i), u = !t && !/* @__PURE__ */ Ee(i) && !/* @__PURE__ */ tt(i) ? a : i;
        return o.has.call(l, u) || Ve(i, u) && o.has.call(l, i) || Ve(a, u) && o.has.call(l, a) || (l.add(u), Qe(l, "add", u, u)), this;
      },
      set(i, l) {
        !t && !/* @__PURE__ */ Ee(l) && !/* @__PURE__ */ tt(l) && (l = /* @__PURE__ */ J(l));
        const o = /* @__PURE__ */ J(this), { has: a, get: u } = ns(o);
        let f = a.call(o, i);
        f || (i = /* @__PURE__ */ J(i), f = a.call(o, i));
        const d = u.call(o, i);
        return o.set(i, l), f ? Ve(l, d) && Qe(o, "set", i, l) : Qe(o, "add", i, l), this;
      },
      delete(i) {
        const l = /* @__PURE__ */ J(this), { has: o, get: a } = ns(l);
        let u = o.call(l, i);
        u || (i = /* @__PURE__ */ J(i), u = o.call(l, i)), a && a.call(l, i);
        const f = l.delete(i);
        return u && Qe(l, "delete", i, void 0), f;
      },
      clear() {
        const i = /* @__PURE__ */ J(this), l = i.size !== 0, o = i.clear();
        return l && Qe(
          i,
          "clear",
          void 0,
          void 0
        ), o;
      }
    }
  ), [
    "keys",
    "values",
    "entries",
    Symbol.iterator
  ].forEach((i) => {
    s[i] = xo(i, e, t);
  }), s;
}
function un(e, t) {
  const s = jo(e, t);
  return (n, i, l) => i === "__v_isReactive" ? !e : i === "__v_isReadonly" ? e : i === "__v_raw" ? n : Reflect.get(
    Y(s, i) && i in n ? s : n,
    i,
    l
  );
}
const Mo = {
  get: /* @__PURE__ */ un(!1, !1)
}, Lo = {
  get: /* @__PURE__ */ un(!1, !0)
}, Fo = {
  get: /* @__PURE__ */ un(!0, !1)
};
const Ti = /* @__PURE__ */ new WeakMap(), $i = /* @__PURE__ */ new WeakMap(), Ri = /* @__PURE__ */ new WeakMap(), Uo = /* @__PURE__ */ new WeakMap();
function Do(e) {
  switch (e) {
    case "Object":
    case "Array":
      return 1;
    case "Map":
    case "Set":
    case "WeakMap":
    case "WeakSet":
      return 2;
    default:
      return 0;
  }
}
// @__NO_SIDE_EFFECTS__
function cn(e) {
  return /* @__PURE__ */ tt(e) ? e : fn(
    e,
    !1,
    Eo,
    Mo,
    Ti
  );
}
// @__NO_SIDE_EFFECTS__
function Ko(e) {
  return fn(
    e,
    !1,
    Po,
    Lo,
    $i
  );
}
// @__NO_SIDE_EFFECTS__
function qs(e) {
  return fn(
    e,
    !0,
    Oo,
    Fo,
    Ri
  );
}
function fn(e, t, s, n, i) {
  if (!te(e) || e.__v_raw && !(t && e.__v_isReactive) || e.__v_skip || !Object.isExtensible(e))
    return e;
  const l = i.get(e);
  if (l)
    return l;
  const o = Do(co(e));
  if (o === 0)
    return e;
  const a = new Proxy(
    e,
    o === 2 ? n : s
  );
  return i.set(e, a), a;
}
// @__NO_SIDE_EFFECTS__
function pt(e) {
  return /* @__PURE__ */ tt(e) ? /* @__PURE__ */ pt(e.__v_raw) : !!(e && e.__v_isReactive);
}
// @__NO_SIDE_EFFECTS__
function tt(e) {
  return !!(e && e.__v_isReadonly);
}
// @__NO_SIDE_EFFECTS__
function Ee(e) {
  return !!(e && e.__v_isShallow);
}
// @__NO_SIDE_EFFECTS__
function dn(e) {
  return e ? !!e.__v_raw : !1;
}
// @__NO_SIDE_EFFECTS__
function J(e) {
  const t = e && e.__v_raw;
  return t ? /* @__PURE__ */ J(t) : e;
}
function No(e) {
  return !Y(e, "__v_skip") && Object.isExtensible(e) && ai(e, "__v_skip", !0), e;
}
const je = (e) => te(e) ? /* @__PURE__ */ cn(e) : e, It = (e) => te(e) ? /* @__PURE__ */ qs(e) : e;
// @__NO_SIDE_EFFECTS__
function be(e) {
  return e ? e.__v_isRef === !0 : !1;
}
// @__NO_SIDE_EFFECTS__
function Z(e) {
  return Ho(e, !1);
}
function Ho(e, t) {
  return /* @__PURE__ */ be(e) ? e : new Vo(e, t);
}
class Vo {
  constructor(t, s) {
    this.dep = new an(), this.__v_isRef = !0, this.__v_isShallow = !1, this._rawValue = s ? t : /* @__PURE__ */ J(t), this._value = s ? t : je(t), this.__v_isShallow = s;
  }
  get value() {
    return this.dep.track(), this._value;
  }
  set value(t) {
    const s = this._rawValue, n = this.__v_isShallow || /* @__PURE__ */ Ee(t) || /* @__PURE__ */ tt(t);
    t = n ? t : /* @__PURE__ */ J(t), Ve(t, s) && (this._rawValue = t, this._value = n ? t : je(t), this.dep.trigger());
  }
}
function Wo(e) {
  return /* @__PURE__ */ be(e) ? e.value : e;
}
const Bo = {
  get: (e, t, s) => t === "__v_raw" ? e : Wo(Reflect.get(e, t, s)),
  set: (e, t, s, n) => {
    const i = e[t];
    return /* @__PURE__ */ be(i) && !/* @__PURE__ */ be(s) ? (i.value = s, !0) : Reflect.set(e, t, s, n);
  }
};
function _i(e) {
  return /* @__PURE__ */ pt(e) ? e : new Proxy(e, Bo);
}
class zo {
  constructor(t, s, n) {
    this.fn = t, this.setter = s, this._value = void 0, this.dep = new an(this), this.__v_isRef = !0, this.deps = void 0, this.depsTail = void 0, this.flags = 16, this.globalVersion = Wt - 1, this.next = void 0, this.effect = this, this.__v_isReadonly = !s, this.isSSR = n;
  }
  /**
   * @internal
   */
  notify() {
    if (this.flags |= 16, !(this.flags & 8) && // avoid infinite self recursion
    ne !== this)
      return gi(this, !0), !0;
  }
  get value() {
    const t = this.dep.track();
    return vi(this), t && (t.version = this.dep.version), this._value;
  }
  set value(t) {
    this.setter && this.setter(t);
  }
}
// @__NO_SIDE_EFFECTS__
function qo(e, t, s = !1) {
  let n, i;
  return N(e) ? n = e : (n = e.get, i = e.set), new zo(n, i, s);
}
const os = {}, us = /* @__PURE__ */ new WeakMap();
let ct;
function Go(e, t = !1, s = ct) {
  if (s) {
    let n = us.get(s);
    n || us.set(s, n = []), n.push(e);
  }
}
function Jo(e, t, s = se) {
  const { immediate: n, deep: i, once: l, scheduler: o, augmentJob: a, call: u } = s, f = (T) => i ? T : /* @__PURE__ */ Ee(T) || i === !1 || i === 0 ? et(T, 1) : et(T);
  let d, g, h, O, V = !1, j = !1;
  if (/* @__PURE__ */ be(e) ? (g = () => e.value, V = /* @__PURE__ */ Ee(e)) : /* @__PURE__ */ pt(e) ? (g = () => f(e), V = !0) : F(e) ? (j = !0, V = e.some((T) => /* @__PURE__ */ pt(T) || /* @__PURE__ */ Ee(T)), g = () => e.map((T) => {
    if (/* @__PURE__ */ be(T))
      return T.value;
    if (/* @__PURE__ */ pt(T))
      return f(T);
    if (N(T))
      return u ? u(T, 2) : T();
  })) : N(e) ? t ? g = u ? () => u(e, 2) : e : g = () => {
    if (h) {
      ze();
      try {
        h();
      } finally {
        qe();
      }
    }
    const T = ct;
    ct = d;
    try {
      return u ? u(e, 3, [O]) : e(O);
    } finally {
      ct = T;
    }
  } : g = We, t && i) {
    const T = g, P = i === !0 ? 1 / 0 : i;
    g = () => et(T(), P);
  }
  const B = So(), W = () => {
    d.stop(), B && B.active && tn(B.effects, d);
  };
  if (l && t) {
    const T = t;
    t = (...P) => {
      const H = T(...P);
      return W(), H;
    };
  }
  let D = j ? new Array(e.length).fill(os) : os;
  const _ = (T) => {
    if (!(!(d.flags & 1) || !d.dirty && !T))
      if (t) {
        const P = d.run();
        if (T || i || V || (j ? P.some((H, X) => Ve(H, D[X])) : Ve(P, D))) {
          h && h();
          const H = ct;
          ct = d;
          try {
            const X = [
              P,
              // pass undefined as the old value when it's changed for the first time
              D === os ? void 0 : j && D[0] === os ? [] : D,
              O
            ];
            D = P, u ? u(t, 3, X) : (
              // @ts-expect-error
              t(...X)
            );
          } finally {
            ct = H;
          }
        }
      } else
        d.run();
  };
  return a && a(_), d = new pi(g), d.scheduler = o ? () => o(_, !1) : _, O = (T) => Go(T, !1, d), h = d.onStop = () => {
    const T = us.get(d);
    if (T) {
      if (u)
        u(T, 4);
      else
        for (const P of T) P();
      us.delete(d);
    }
  }, t ? n ? _(!0) : D = d.run() : o ? o(_.bind(null, !0), !0) : d.run(), W.pause = d.pause.bind(d), W.resume = d.resume.bind(d), W.stop = W, W;
}
function et(e, t = 1 / 0, s) {
  if (t <= 0 || !te(e) || e.__v_skip || (s = s || /* @__PURE__ */ new Map(), (s.get(e) || 0) >= t))
    return e;
  if (s.set(e, t), t--, /* @__PURE__ */ be(e))
    et(e.value, t, s);
  else if (F(e))
    for (let n = 0; n < e.length; n++)
      et(e[n], t, s);
  else if (ms(e) || Tt(e))
    e.forEach((n) => {
      et(n, t, s);
    });
  else if (ri(e)) {
    for (const n in e)
      et(e[n], t, s);
    for (const n of Object.getOwnPropertySymbols(e))
      Object.prototype.propertyIsEnumerable.call(e, n) && et(e[n], t, s);
  }
  return e;
}
/**
* @vue/runtime-core v3.5.39
* (c) 2018-present Yuxi (Evan) You and Vue contributors
* @license MIT
**/
function Zt(e, t, s, n) {
  try {
    return n ? e(...n) : e();
  } catch (i) {
    Ts(i, t, s);
  }
}
function Me(e, t, s, n) {
  if (N(e)) {
    const i = Zt(e, t, s, n);
    return i && oi(i) && i.catch((l) => {
      Ts(l, t, s);
    }), i;
  }
  if (F(e)) {
    const i = [];
    for (let l = 0; l < e.length; l++)
      i.push(Me(e[l], t, s, n));
    return i;
  }
}
function Ts(e, t, s, n = !0) {
  const i = t ? t.vnode : null, { errorHandler: l, throwUnhandledErrorInProduction: o } = t && t.appContext.config || se;
  if (t) {
    let a = t.parent;
    const u = t.proxy, f = `https://vuejs.org/error-reference/#runtime-${s}`;
    for (; a; ) {
      const d = a.ec;
      if (d) {
        for (let g = 0; g < d.length; g++)
          if (d[g](e, u, f) === !1)
            return;
      }
      a = a.parent;
    }
    if (l) {
      ze(), Zt(l, null, 10, [
        e,
        u,
        f
      ]), qe();
      return;
    }
  }
  Yo(e, s, i, n, o);
}
function Yo(e, t, s, n = !0, i = !1) {
  if (i)
    throw e;
  console.error(e);
}
const me = [];
let Ke = -1;
const $t = [];
let nt = null, St = 0;
const Ii = /* @__PURE__ */ Promise.resolve();
let cs = null;
function Xo(e) {
  const t = cs || Ii;
  return e ? t.then(this ? e.bind(this) : e) : t;
}
function Zo(e) {
  let t = Ke + 1, s = me.length;
  for (; t < s; ) {
    const n = t + s >>> 1, i = me[n], l = zt(i);
    l < e || l === e && i.flags & 2 ? t = n + 1 : s = n;
  }
  return t;
}
function pn(e) {
  if (!(e.flags & 1)) {
    const t = zt(e), s = me[me.length - 1];
    !s || // fast path when the job id is larger than the tail
    !(e.flags & 2) && t >= zt(s) ? me.push(e) : me.splice(Zo(t), 0, e), e.flags |= 1, Ai();
  }
}
function Ai() {
  cs || (cs = Ii.then(Oi));
}
function Qo(e) {
  F(e) ? $t.push(...e) : nt && e.id === -1 ? nt.splice(St + 1, 0, e) : e.flags & 1 || ($t.push(e), e.flags |= 1), Ai();
}
function Rn(e, t, s = Ke + 1) {
  for (; s < me.length; s++) {
    const n = me[s];
    if (n && n.flags & 2) {
      if (e && n.id !== e.uid)
        continue;
      me.splice(s, 1), s--, n.flags & 4 && (n.flags &= -2), n(), n.flags & 4 || (n.flags &= -2);
    }
  }
}
function Ei(e) {
  if ($t.length) {
    const t = [...new Set($t)].sort(
      (s, n) => zt(s) - zt(n)
    );
    if ($t.length = 0, nt) {
      nt.push(...t);
      return;
    }
    for (nt = t, St = 0; St < nt.length; St++) {
      const s = nt[St];
      s.flags & 4 && (s.flags &= -2), s.flags & 8 || s(), s.flags &= -2;
    }
    nt = null, St = 0;
  }
}
const zt = (e) => e.id == null ? e.flags & 2 ? -1 : 1 / 0 : e.id;
function Oi(e) {
  try {
    for (Ke = 0; Ke < me.length; Ke++) {
      const t = me[Ke];
      t && !(t.flags & 8) && (t.flags & 4 && (t.flags &= -2), Zt(
        t,
        t.i,
        t.i ? 15 : 14
      ), t.flags & 4 || (t.flags &= -2));
    }
  } finally {
    for (; Ke < me.length; Ke++) {
      const t = me[Ke];
      t && (t.flags &= -2);
    }
    Ke = -1, me.length = 0, Ei(), cs = null, (me.length || $t.length) && Oi();
  }
}
let Re = null, Pi = null;
function fs(e) {
  const t = Re;
  return Re = e, Pi = e && e.type.__scopeId || null, t;
}
function el(e, t = Re, s) {
  if (!t || e._n)
    return e;
  const n = (...i) => {
    n._d && Un(-1);
    const l = fs(t);
    let o;
    try {
      o = e(...i);
    } finally {
      fs(l), n._d && Un(1);
    }
    return o;
  };
  return n._n = !0, n._c = !0, n._d = !0, n;
}
function fe(e, t) {
  if (Re === null)
    return e;
  const s = Is(Re), n = e.dirs || (e.dirs = []);
  for (let i = 0; i < t.length; i++) {
    let [l, o, a, u = se] = t[i];
    l && (N(l) && (l = {
      mounted: l,
      updated: l
    }), l.deep && et(o), n.push({
      dir: l,
      instance: s,
      value: o,
      oldValue: void 0,
      arg: a,
      modifiers: u
    }));
  }
  return e;
}
function at(e, t, s, n) {
  const i = e.dirs, l = t && t.dirs;
  for (let o = 0; o < i.length; o++) {
    const a = i[o];
    l && (a.oldValue = l[o].value);
    let u = a.dir[n];
    u && (ze(), Me(u, s, 8, [
      e.el,
      a,
      e,
      t
    ]), qe());
  }
}
function tl(e, t) {
  if (ge) {
    let s = ge.provides;
    const n = ge.parent && ge.parent.provides;
    n === s && (s = ge.provides = Object.create(n)), s[e] = t;
  }
}
function rs(e, t, s = !1) {
  const n = er();
  if (n || Rt) {
    let i = Rt ? Rt._context.provides : n ? n.parent == null || n.ce ? n.vnode.appContext && n.vnode.appContext.provides : n.parent.provides : void 0;
    if (i && e in i)
      return i[e];
    if (arguments.length > 1)
      return s && N(t) ? t.call(n && n.proxy) : t;
  }
}
const sl = /* @__PURE__ */ Symbol.for("v-scx"), nl = () => rs(sl);
function Ls(e, t, s) {
  return xi(e, t, s);
}
function xi(e, t, s = se) {
  const { immediate: n, deep: i, flush: l, once: o } = s, a = pe({}, s), u = t && n || !t && l !== "post";
  let f;
  if (Gt) {
    if (l === "sync") {
      const O = nl();
      f = O.__watcherHandles || (O.__watcherHandles = []);
    } else if (!u) {
      const O = () => {
      };
      return O.stop = We, O.resume = We, O.pause = We, O;
    }
  }
  const d = ge;
  a.call = (O, V, j) => Me(O, d, V, j);
  let g = !1;
  l === "post" ? a.scheduler = (O) => {
    Se(O, d && d.suspense);
  } : l !== "sync" && (g = !0, a.scheduler = (O, V) => {
    V ? O() : pn(O);
  }), a.augmentJob = (O) => {
    t && (O.flags |= 4), g && (O.flags |= 2, d && (O.id = d.uid, O.i = d));
  };
  const h = Jo(e, t, a);
  return Gt && (f ? f.push(h) : u && h()), h;
}
function il(e, t, s) {
  const n = this.proxy, i = re(e) ? e.includes(".") ? ji(n, e) : () => n[e] : e.bind(n, n);
  let l;
  N(t) ? l = t : (l = t.handler, s = t);
  const o = Qt(this), a = xi(i, l.bind(n), s);
  return o(), a;
}
function ji(e, t) {
  const s = t.split(".");
  return () => {
    let n = e;
    for (let i = 0; i < s.length && n; i++)
      n = n[s[i]];
    return n;
  };
}
const ol = /* @__PURE__ */ Symbol("_vte"), ll = (e) => e.__isTeleport, Fs = /* @__PURE__ */ Symbol("_leaveCb");
function hn(e, t) {
  e.shapeFlag & 6 && e.component ? (e.transition = t, hn(e.component.subTree, t)) : e.shapeFlag & 128 ? (e.ssContent.transition = t.clone(e.ssContent), e.ssFallback.transition = t.clone(e.ssFallback)) : e.transition = t;
}
// @__NO_SIDE_EFFECTS__
function ht(e, t) {
  return N(e) ? (
    // #8236: extend call and options.name access are considered side-effects
    // by Rollup, so we have to wrap it in a pure-annotated IIFE.
    pe({ name: e.name }, t, { setup: e })
  ) : e;
}
function Mi(e) {
  e.ids = [e.ids[0] + e.ids[2]++ + "-", 0, 0];
}
function _n(e, t) {
  let s;
  return !!((s = Object.getOwnPropertyDescriptor(e, t)) && !s.configurable);
}
const ds = /* @__PURE__ */ new WeakMap();
function Kt(e, t, s, n, i = !1) {
  if (F(e)) {
    e.forEach(
      (j, B) => Kt(
        j,
        t && (F(t) ? t[B] : t),
        s,
        n,
        i
      )
    );
    return;
  }
  if (Nt(n) && !i) {
    n.shapeFlag & 512 && n.type.__asyncResolved && n.component.subTree.component && Kt(e, t, s, n.component.subTree);
    return;
  }
  const l = n.shapeFlag & 4 ? Is(n.component) : n.el, o = i ? null : l, { i: a, r: u } = e, f = t && t.r, d = a.refs === se ? a.refs = {} : a.refs, g = a.setupState, h = /* @__PURE__ */ J(g), O = g === se ? ii : (j) => _n(d, j) ? !1 : Y(h, j), V = (j, B) => !(B && _n(d, B));
  if (f != null && f !== u) {
    if (In(t), re(f))
      d[f] = null, O(f) && (g[f] = null);
    else if (/* @__PURE__ */ be(f)) {
      const j = t;
      V(f, j.k) && (f.value = null), j.k && (d[j.k] = null);
    }
  }
  if (N(u)) {
    ze();
    try {
      Zt(u, a, 12, [o, d]);
    } finally {
      qe();
    }
  } else {
    const j = re(u), B = /* @__PURE__ */ be(u);
    if (j || B) {
      const W = () => {
        if (e.f) {
          const D = j ? O(u) ? g[u] : d[u] : V() || !e.k ? u.value : d[e.k];
          if (i)
            F(D) && tn(D, l);
          else if (F(D))
            D.includes(l) || D.push(l);
          else if (j)
            d[u] = [l], O(u) && (g[u] = d[u]);
          else {
            const _ = [l];
            V(u, e.k) && (u.value = _), e.k && (d[e.k] = _);
          }
        } else j ? (d[u] = o, O(u) && (g[u] = o)) : B && (V(u, e.k) && (u.value = o), e.k && (d[e.k] = o));
      };
      if (o) {
        const D = () => {
          W(), ds.delete(e);
        };
        D.id = -1, ds.set(e, D), Se(D, s);
      } else
        In(e), W();
    }
  }
}
function In(e) {
  const t = ds.get(e);
  t && (t.flags |= 8, ds.delete(e));
}
Ss().requestIdleCallback;
Ss().cancelIdleCallback;
const Nt = (e) => !!e.type.__asyncLoader, Li = (e) => e.type.__isKeepAlive;
function rl(e, t) {
  Fi(e, "a", t);
}
function al(e, t) {
  Fi(e, "da", t);
}
function Fi(e, t, s = ge) {
  const n = e.__wdc || (e.__wdc = () => {
    let i = s;
    for (; i; ) {
      if (i.isDeactivated)
        return;
      i = i.parent;
    }
    return e();
  });
  if ($s(t, n, s), s) {
    let i = s.parent;
    for (; i && i.parent; )
      Li(i.parent.vnode) && ul(n, t, s, i), i = i.parent;
  }
}
function ul(e, t, s, n) {
  const i = $s(
    t,
    e,
    n,
    !0
    /* prepend */
  );
  gn(() => {
    tn(n[t], i);
  }, s);
}
function $s(e, t, s = ge, n = !1) {
  if (s) {
    const i = s[e] || (s[e] = []), l = t.__weh || (t.__weh = (...o) => {
      ze();
      const a = Qt(s), u = Me(t, s, e, o);
      return a(), qe(), u;
    });
    return n ? i.unshift(l) : i.push(l), l;
  }
}
const st = (e) => (t, s = ge) => {
  (!Gt || e === "sp") && $s(e, (...n) => t(...n), s);
}, cl = st("bm"), Ui = st("m"), fl = st(
  "bu"
), dl = st("u"), pl = st(
  "bum"
), gn = st("um"), hl = st(
  "sp"
), gl = st("rtg"), bl = st("rtc");
function yl(e, t = ge) {
  $s("ec", e, t);
}
const vl = "components";
function Ct(e, t) {
  return wl(vl, e, !0, t) || e;
}
const ml = /* @__PURE__ */ Symbol.for("v-ndc");
function wl(e, t, s = !0, n = !1) {
  const i = Re || ge;
  if (i) {
    const l = i.type;
    {
      const a = or(
        l,
        !1
      );
      if (a && (a === t || a === we(t) || a === Cs(we(t))))
        return l;
    }
    const o = (
      // local registration
      // check instance[type] first which is resolved for options API
      An(i[e] || l[e], t) || // global registration
      An(i.appContext[e], t)
    );
    return !o && n ? l : o;
  }
}
function An(e, t) {
  return e && (e[t] || e[we(t)] || e[Cs(we(t))]);
}
function Oe(e, t, s, n) {
  let i;
  const l = s, o = F(e);
  if (o || re(e)) {
    const a = o && /* @__PURE__ */ pt(e);
    let u = !1, f = !1;
    a && (u = !/* @__PURE__ */ Ee(e), f = /* @__PURE__ */ tt(e), e = ks(e)), i = new Array(e.length);
    for (let d = 0, g = e.length; d < g; d++)
      i[d] = t(
        u ? f ? It(je(e[d])) : je(e[d]) : e[d],
        d,
        void 0,
        l
      );
  } else if (typeof e == "number") {
    i = new Array(e);
    for (let a = 0; a < e; a++)
      i[a] = t(a + 1, a, void 0, l);
  } else if (te(e))
    if (e[Symbol.iterator])
      i = Array.from(
        e,
        (a, u) => t(a, u, void 0, l)
      );
    else {
      const a = Object.keys(e);
      i = new Array(a.length);
      for (let u = 0, f = a.length; u < f; u++) {
        const d = a[u];
        i[u] = t(e[d], d, u, l);
      }
    }
  else
    i = [];
  return i;
}
const Gs = (e) => e ? oo(e) ? Is(e) : Gs(e.parent) : null, Ht = (
  // Move PURE marker to new line to workaround compiler discarding it
  // due to type annotation
  /* @__PURE__ */ pe(/* @__PURE__ */ Object.create(null), {
    $: (e) => e,
    $el: (e) => e.vnode.el,
    $data: (e) => e.data,
    $props: (e) => e.props,
    $attrs: (e) => e.attrs,
    $slots: (e) => e.slots,
    $refs: (e) => e.refs,
    $parent: (e) => Gs(e.parent),
    $root: (e) => Gs(e.root),
    $host: (e) => e.ce,
    $emit: (e) => e.emit,
    $options: (e) => Ki(e),
    $forceUpdate: (e) => e.f || (e.f = () => {
      pn(e.update);
    }),
    $nextTick: (e) => e.n || (e.n = Xo.bind(e.proxy)),
    $watch: (e) => il.bind(e)
  })
), Us = (e, t) => e !== se && !e.__isScriptSetup && Y(e, t), Cl = {
  get({ _: e }, t) {
    if (t === "__v_skip")
      return !0;
    const { ctx: s, setupState: n, data: i, props: l, accessCache: o, type: a, appContext: u } = e;
    if (t[0] !== "$") {
      const h = o[t];
      if (h !== void 0)
        switch (h) {
          case 1:
            return n[t];
          case 2:
            return i[t];
          case 4:
            return s[t];
          case 3:
            return l[t];
        }
      else {
        if (Us(n, t))
          return o[t] = 1, n[t];
        if (i !== se && Y(i, t))
          return o[t] = 2, i[t];
        if (Y(l, t))
          return o[t] = 3, l[t];
        if (s !== se && Y(s, t))
          return o[t] = 4, s[t];
        Js && (o[t] = 0);
      }
    }
    const f = Ht[t];
    let d, g;
    if (f)
      return t === "$attrs" && he(e.attrs, "get", ""), f(e);
    if (
      // css module (injected by vue-loader)
      (d = a.__cssModules) && (d = d[t])
    )
      return d;
    if (s !== se && Y(s, t))
      return o[t] = 4, s[t];
    if (
      // global properties
      g = u.config.globalProperties, Y(g, t)
    )
      return g[t];
  },
  set({ _: e }, t, s) {
    const { data: n, setupState: i, ctx: l } = e;
    return Us(i, t) ? (i[t] = s, !0) : n !== se && Y(n, t) ? (n[t] = s, !0) : Y(e.props, t) || t[0] === "$" && t.slice(1) in e ? !1 : (l[t] = s, !0);
  },
  has({
    _: { data: e, setupState: t, accessCache: s, ctx: n, appContext: i, props: l, type: o }
  }, a) {
    let u;
    return !!(s[a] || e !== se && a[0] !== "$" && Y(e, a) || Us(t, a) || Y(l, a) || Y(n, a) || Y(Ht, a) || Y(i.config.globalProperties, a) || (u = o.__cssModules) && u[a]);
  },
  defineProperty(e, t, s) {
    return s.get != null ? e._.accessCache[t] = 0 : Y(s, "value") && this.set(e, t, s.value, null), Reflect.defineProperty(e, t, s);
  }
};
function En(e) {
  return F(e) ? e.reduce(
    (t, s) => (t[s] = null, t),
    {}
  ) : e;
}
let Js = !0;
function Sl(e) {
  const t = Ki(e), s = e.proxy, n = e.ctx;
  Js = !1, t.beforeCreate && On(t.beforeCreate, e, "bc");
  const {
    // state
    data: i,
    computed: l,
    methods: o,
    watch: a,
    provide: u,
    inject: f,
    // lifecycle
    created: d,
    beforeMount: g,
    mounted: h,
    beforeUpdate: O,
    updated: V,
    activated: j,
    deactivated: B,
    beforeDestroy: W,
    beforeUnmount: D,
    destroyed: _,
    unmounted: T,
    render: P,
    renderTracked: H,
    renderTriggered: X,
    errorCaptured: ue,
    serverPrefetch: le,
    // public API
    expose: ke,
    inheritAttrs: Le,
    // assets
    components: Ie,
    directives: bt,
    filters: yt
  } = t;
  if (f && kl(f, n, null), o)
    for (const ie in o) {
      const Q = o[ie];
      N(Q) && (n[ie] = Q.bind(s));
    }
  if (i) {
    const ie = i.call(s, s);
    te(ie) && (e.data = /* @__PURE__ */ cn(ie));
  }
  if (Js = !0, l)
    for (const ie in l) {
      const Q = l[ie], Ge = N(Q) ? Q.bind(s, s) : N(Q.get) ? Q.get.bind(s, s) : We, vt = !N(Q) && N(Q.set) ? Q.set.bind(s) : We, Je = $e({
        get: Ge,
        set: vt
      });
      Object.defineProperty(n, ie, {
        enumerable: !0,
        configurable: !0,
        get: () => Je.value,
        set: (Ae) => Je.value = Ae
      });
    }
  if (a)
    for (const ie in a)
      Di(a[ie], n, s, ie);
  if (u) {
    const ie = N(u) ? u.call(s) : u;
    Reflect.ownKeys(ie).forEach((Q) => {
      tl(Q, ie[Q]);
    });
  }
  d && On(d, e, "c");
  function ce(ie, Q) {
    F(Q) ? Q.forEach((Ge) => ie(Ge.bind(s))) : Q && ie(Q.bind(s));
  }
  if (ce(cl, g), ce(Ui, h), ce(fl, O), ce(dl, V), ce(rl, j), ce(al, B), ce(yl, ue), ce(bl, H), ce(gl, X), ce(pl, D), ce(gn, T), ce(hl, le), F(ke))
    if (ke.length) {
      const ie = e.exposed || (e.exposed = {});
      ke.forEach((Q) => {
        Object.defineProperty(ie, Q, {
          get: () => s[Q],
          set: (Ge) => s[Q] = Ge,
          enumerable: !0
        });
      });
    } else e.exposed || (e.exposed = {});
  P && e.render === We && (e.render = P), Le != null && (e.inheritAttrs = Le), Ie && (e.components = Ie), bt && (e.directives = bt), le && Mi(e);
}
function kl(e, t, s = We) {
  F(e) && (e = Ys(e));
  for (const n in e) {
    const i = e[n];
    let l;
    te(i) ? "default" in i ? l = rs(
      i.from || n,
      i.default,
      !0
    ) : l = rs(i.from || n) : l = rs(i), /* @__PURE__ */ be(l) ? Object.defineProperty(t, n, {
      enumerable: !0,
      configurable: !0,
      get: () => l.value,
      set: (o) => l.value = o
    }) : t[n] = l;
  }
}
function On(e, t, s) {
  Me(
    F(e) ? e.map((n) => n.bind(t.proxy)) : e.bind(t.proxy),
    t,
    s
  );
}
function Di(e, t, s, n) {
  let i = n.includes(".") ? ji(s, n) : () => s[n];
  if (re(e)) {
    const l = t[e];
    N(l) && Ls(i, l);
  } else if (N(e))
    Ls(i, e.bind(s));
  else if (te(e))
    if (F(e))
      e.forEach((l) => Di(l, t, s, n));
    else {
      const l = N(e.handler) ? e.handler.bind(s) : t[e.handler];
      N(l) && Ls(i, l, e);
    }
}
function Ki(e) {
  const t = e.type, { mixins: s, extends: n } = t, {
    mixins: i,
    optionsCache: l,
    config: { optionMergeStrategies: o }
  } = e.appContext, a = l.get(t);
  let u;
  return a ? u = a : !i.length && !s && !n ? u = t : (u = {}, i.length && i.forEach(
    (f) => ps(u, f, o, !0)
  ), ps(u, t, o)), te(t) && l.set(t, u), u;
}
function ps(e, t, s, n = !1) {
  const { mixins: i, extends: l } = t;
  l && ps(e, l, s, !0), i && i.forEach(
    (o) => ps(e, o, s, !0)
  );
  for (const o in t)
    if (!(n && o === "expose")) {
      const a = Tl[o] || s && s[o];
      e[o] = a ? a(e[o], t[o]) : t[o];
    }
  return e;
}
const Tl = {
  data: Pn,
  props: xn,
  emits: xn,
  // objects
  methods: jt,
  computed: jt,
  // lifecycle
  beforeCreate: ye,
  created: ye,
  beforeMount: ye,
  mounted: ye,
  beforeUpdate: ye,
  updated: ye,
  beforeDestroy: ye,
  beforeUnmount: ye,
  destroyed: ye,
  unmounted: ye,
  activated: ye,
  deactivated: ye,
  errorCaptured: ye,
  serverPrefetch: ye,
  // assets
  components: jt,
  directives: jt,
  // watch
  watch: Rl,
  // provide / inject
  provide: Pn,
  inject: $l
};
function Pn(e, t) {
  return t ? e ? function() {
    return pe(
      N(e) ? e.call(this, this) : e,
      N(t) ? t.call(this, this) : t
    );
  } : t : e;
}
function $l(e, t) {
  return jt(Ys(e), Ys(t));
}
function Ys(e) {
  if (F(e)) {
    const t = {};
    for (let s = 0; s < e.length; s++)
      t[e[s]] = e[s];
    return t;
  }
  return e;
}
function ye(e, t) {
  return e ? [...new Set([].concat(e, t))] : t;
}
function jt(e, t) {
  return e ? pe(/* @__PURE__ */ Object.create(null), e, t) : t;
}
function xn(e, t) {
  return e ? F(e) && F(t) ? [.../* @__PURE__ */ new Set([...e, ...t])] : pe(
    /* @__PURE__ */ Object.create(null),
    En(e),
    En(t ?? {})
  ) : t;
}
function Rl(e, t) {
  if (!e) return t;
  if (!t) return e;
  const s = pe(/* @__PURE__ */ Object.create(null), e);
  for (const n in t)
    s[n] = ye(e[n], t[n]);
  return s;
}
function Ni() {
  return {
    app: null,
    config: {
      isNativeTag: ii,
      performance: !1,
      globalProperties: {},
      optionMergeStrategies: {},
      errorHandler: void 0,
      warnHandler: void 0,
      compilerOptions: {}
    },
    mixins: [],
    components: {},
    directives: {},
    provides: /* @__PURE__ */ Object.create(null),
    optionsCache: /* @__PURE__ */ new WeakMap(),
    propsCache: /* @__PURE__ */ new WeakMap(),
    emitsCache: /* @__PURE__ */ new WeakMap()
  };
}
let _l = 0;
function Il(e, t) {
  return function(n, i = null) {
    N(n) || (n = pe({}, n)), i != null && !te(i) && (i = null);
    const l = Ni(), o = /* @__PURE__ */ new WeakSet(), a = [];
    let u = !1;
    const f = l.app = {
      _uid: _l++,
      _component: n,
      _props: i,
      _container: null,
      _context: l,
      _instance: null,
      version: rr,
      get config() {
        return l.config;
      },
      set config(d) {
      },
      use(d, ...g) {
        return o.has(d) || (d && N(d.install) ? (o.add(d), d.install(f, ...g)) : N(d) && (o.add(d), d(f, ...g))), f;
      },
      mixin(d) {
        return l.mixins.includes(d) || l.mixins.push(d), f;
      },
      component(d, g) {
        return g ? (l.components[d] = g, f) : l.components[d];
      },
      directive(d, g) {
        return g ? (l.directives[d] = g, f) : l.directives[d];
      },
      mount(d, g, h) {
        if (!u) {
          const O = f._ceVNode || xe(n, i);
          return O.appContext = l, h === !0 ? h = "svg" : h === !1 && (h = void 0), e(O, d, h), u = !0, f._container = d, d.__vue_app__ = f, Is(O.component);
        }
      },
      onUnmount(d) {
        a.push(d);
      },
      unmount() {
        u && (Me(
          a,
          f._instance,
          16
        ), e(null, f._container), delete f._container.__vue_app__);
      },
      provide(d, g) {
        return l.provides[d] = g, f;
      },
      runWithContext(d) {
        const g = Rt;
        Rt = f;
        try {
          return d();
        } finally {
          Rt = g;
        }
      }
    };
    return f;
  };
}
let Rt = null;
const Al = (e, t) => t === "modelValue" || t === "model-value" ? e.modelModifiers : e[`${t}Modifiers`] || e[`${we(t)}Modifiers`] || e[`${ot(t)}Modifiers`];
function El(e, t, ...s) {
  if (e.isUnmounted) return;
  const n = e.vnode.props || se;
  let i = s;
  const l = t.startsWith("update:"), o = l && Al(n, t.slice(7));
  o && (o.trim && (i = s.map((d) => re(d) ? d.trim() : d)), o.number && (i = s.map(nn)));
  let a, u = n[a = Os(t)] || // also try camelCase event handler (#2249)
  n[a = Os(we(t))];
  !u && l && (u = n[a = Os(ot(t))]), u && Me(
    u,
    e,
    6,
    i
  );
  const f = n[a + "Once"];
  if (f) {
    if (!e.emitted)
      e.emitted = {};
    else if (e.emitted[a])
      return;
    e.emitted[a] = !0, Me(
      f,
      e,
      6,
      i
    );
  }
}
const Ol = /* @__PURE__ */ new WeakMap();
function Hi(e, t, s = !1) {
  const n = s ? Ol : t.emitsCache, i = n.get(e);
  if (i !== void 0)
    return i;
  const l = e.emits;
  let o = {}, a = !1;
  if (!N(e)) {
    const u = (f) => {
      const d = Hi(f, t, !0);
      d && (a = !0, pe(o, d));
    };
    !s && t.mixins.length && t.mixins.forEach(u), e.extends && u(e.extends), e.mixins && e.mixins.forEach(u);
  }
  return !l && !a ? (te(e) && n.set(e, null), null) : (F(l) ? l.forEach((u) => o[u] = null) : pe(o, l), te(e) && n.set(e, o), o);
}
function Rs(e, t) {
  return !e || !ys(t) ? !1 : (t = t.slice(2), t = t === "Once" ? t : t.replace(/Once$/, ""), Y(e, t[0].toLowerCase() + t.slice(1)) || Y(e, ot(t)) || Y(e, t));
}
function jn(e) {
  const {
    type: t,
    vnode: s,
    proxy: n,
    withProxy: i,
    propsOptions: [l],
    slots: o,
    attrs: a,
    emit: u,
    render: f,
    renderCache: d,
    props: g,
    data: h,
    setupState: O,
    ctx: V,
    inheritAttrs: j
  } = e, B = fs(e);
  let W, D;
  try {
    if (s.shapeFlag & 4) {
      const T = i || n, P = T;
      W = He(
        f.call(
          P,
          T,
          d,
          g,
          O,
          h,
          V
        )
      ), D = a;
    } else {
      const T = t;
      W = He(
        T.length > 1 ? T(
          g,
          { attrs: a, slots: o, emit: u }
        ) : T(
          g,
          null
        )
      ), D = t.props ? a : Pl(a);
    }
  } catch (T) {
    Vt.length = 0, Ts(T, e, 1), W = xe(it);
  }
  let _ = W;
  if (D && j !== !1) {
    const T = Object.keys(D), { shapeFlag: P } = _;
    T.length && P & 7 && (l && T.some(vs) && (D = xl(
      D,
      l
    )), _ = At(_, D, !1, !0));
  }
  return s.dirs && (_ = At(_, null, !1, !0), _.dirs = _.dirs ? _.dirs.concat(s.dirs) : s.dirs), s.transition && hn(_, s.transition), W = _, fs(B), W;
}
const Pl = (e) => {
  let t;
  for (const s in e)
    (s === "class" || s === "style" || ys(s)) && ((t || (t = {}))[s] = e[s]);
  return t;
}, xl = (e, t) => {
  const s = {};
  for (const n in e)
    (!vs(n) || !(n.slice(9) in t)) && (s[n] = e[n]);
  return s;
};
function jl(e, t, s) {
  const { props: n, children: i, component: l } = e, { props: o, children: a, patchFlag: u } = t, f = l.emitsOptions;
  if (t.dirs || t.transition)
    return !0;
  if (s && u >= 0) {
    if (u & 1024)
      return !0;
    if (u & 16)
      return n ? Mn(n, o, f) : !!o;
    if (u & 8) {
      const d = t.dynamicProps;
      for (let g = 0; g < d.length; g++) {
        const h = d[g];
        if (Vi(o, n, h) && !Rs(f, h))
          return !0;
      }
    }
  } else
    return (i || a) && (!a || !a.$stable) ? !0 : n === o ? !1 : n ? o ? Mn(n, o, f) : !0 : !!o;
  return !1;
}
function Mn(e, t, s) {
  const n = Object.keys(t);
  if (n.length !== Object.keys(e).length)
    return !0;
  for (let i = 0; i < n.length; i++) {
    const l = n[i];
    if (Vi(t, e, l) && !Rs(s, l))
      return !0;
  }
  return !1;
}
function Vi(e, t, s) {
  const n = e[s], i = t[s];
  return s === "style" && te(n) && te(i) ? !Xt(n, i) : n !== i;
}
function Ml({ vnode: e, parent: t, suspense: s }, n) {
  for (; t; ) {
    const i = t.subTree;
    if (i.suspense && i.suspense.activeBranch === e && (i.suspense.vnode.el = i.el = n, e = i), i === e)
      (e = t.vnode).el = n, t = t.parent;
    else
      break;
  }
  s && s.activeBranch === e && (s.vnode.el = n);
}
const Wi = {}, Bi = () => Object.create(Wi), zi = (e) => Object.getPrototypeOf(e) === Wi;
function Ll(e, t, s, n = !1) {
  const i = {}, l = Bi();
  e.propsDefaults = /* @__PURE__ */ Object.create(null), qi(e, t, i, l);
  for (const o in e.propsOptions[0])
    o in i || (i[o] = void 0);
  s ? e.props = n ? i : /* @__PURE__ */ Ko(i) : e.type.props ? e.props = i : e.props = l, e.attrs = l;
}
function Fl(e, t, s, n) {
  const {
    props: i,
    attrs: l,
    vnode: { patchFlag: o }
  } = e, a = /* @__PURE__ */ J(i), [u] = e.propsOptions;
  let f = !1;
  if (
    // always force full diff in dev
    // - #1942 if hmr is enabled with sfc component
    // - vite#872 non-sfc component used by sfc component
    (n || o > 0) && !(o & 16)
  ) {
    if (o & 8) {
      const d = e.vnode.dynamicProps;
      for (let g = 0; g < d.length; g++) {
        let h = d[g];
        if (Rs(e.emitsOptions, h))
          continue;
        const O = t[h];
        if (u)
          if (Y(l, h))
            O !== l[h] && (l[h] = O, f = !0);
          else {
            const V = we(h);
            i[V] = Xs(
              u,
              a,
              V,
              O,
              e,
              !1
            );
          }
        else
          O !== l[h] && (l[h] = O, f = !0);
      }
    }
  } else {
    qi(e, t, i, l) && (f = !0);
    let d;
    for (const g in a)
      (!t || // for camelCase
      !Y(t, g) && // it's possible the original props was passed in as kebab-case
      // and converted to camelCase (#955)
      ((d = ot(g)) === g || !Y(t, d))) && (u ? s && // for camelCase
      (s[g] !== void 0 || // for kebab-case
      s[d] !== void 0) && (i[g] = Xs(
        u,
        a,
        g,
        void 0,
        e,
        !0
      )) : delete i[g]);
    if (l !== a)
      for (const g in l)
        (!t || !Y(t, g)) && (delete l[g], f = !0);
  }
  f && Qe(e.attrs, "set", "");
}
function qi(e, t, s, n) {
  const [i, l] = e.propsOptions;
  let o = !1, a;
  if (t)
    for (let u in t) {
      if (Ft(u))
        continue;
      const f = t[u];
      let d;
      i && Y(i, d = we(u)) ? !l || !l.includes(d) ? s[d] = f : (a || (a = {}))[d] = f : Rs(e.emitsOptions, u) || (!(u in n) || f !== n[u]) && (n[u] = f, o = !0);
    }
  if (l) {
    const u = /* @__PURE__ */ J(s), f = a || se;
    for (let d = 0; d < l.length; d++) {
      const g = l[d];
      s[g] = Xs(
        i,
        u,
        g,
        f[g],
        e,
        !Y(f, g)
      );
    }
  }
  return o;
}
function Xs(e, t, s, n, i, l) {
  const o = e[s];
  if (o != null) {
    const a = Y(o, "default");
    if (a && n === void 0) {
      const u = o.default;
      if (o.type !== Function && !o.skipFactory && N(u)) {
        const { propsDefaults: f } = i;
        if (s in f)
          n = f[s];
        else {
          const d = Qt(i);
          n = f[s] = u.call(
            null,
            t
          ), d();
        }
      } else
        n = u;
      i.ce && i.ce._setProp(s, n);
    }
    o[
      0
      /* shouldCast */
    ] && (l && !a ? n = !1 : o[
      1
      /* shouldCastTrue */
    ] && (n === "" || n === ot(s)) && (n = !0));
  }
  return n;
}
const Ul = /* @__PURE__ */ new WeakMap();
function Gi(e, t, s = !1) {
  const n = s ? Ul : t.propsCache, i = n.get(e);
  if (i)
    return i;
  const l = e.props, o = {}, a = [];
  let u = !1;
  if (!N(e)) {
    const d = (g) => {
      u = !0;
      const [h, O] = Gi(g, t, !0);
      pe(o, h), O && a.push(...O);
    };
    !s && t.mixins.length && t.mixins.forEach(d), e.extends && d(e.extends), e.mixins && e.mixins.forEach(d);
  }
  if (!l && !u)
    return te(e) && n.set(e, kt), kt;
  if (F(l))
    for (let d = 0; d < l.length; d++) {
      const g = we(l[d]);
      Ln(g) && (o[g] = se);
    }
  else if (l)
    for (const d in l) {
      const g = we(d);
      if (Ln(g)) {
        const h = l[d], O = o[g] = F(h) || N(h) ? { type: h } : pe({}, h), V = O.type;
        let j = !1, B = !0;
        if (F(V))
          for (let W = 0; W < V.length; ++W) {
            const D = V[W], _ = N(D) && D.name;
            if (_ === "Boolean") {
              j = !0;
              break;
            } else _ === "String" && (B = !1);
          }
        else
          j = N(V) && V.name === "Boolean";
        O[
          0
          /* shouldCast */
        ] = j, O[
          1
          /* shouldCastTrue */
        ] = B, (j || Y(O, "default")) && a.push(g);
      }
    }
  const f = [o, a];
  return te(e) && n.set(e, f), f;
}
function Ln(e) {
  return e[0] !== "$" && !Ft(e);
}
const bn = (e) => e === "_" || e === "_ctx" || e === "$stable", yn = (e) => F(e) ? e.map(He) : [He(e)], Dl = (e, t, s) => {
  if (t._n)
    return t;
  const n = el((...i) => yn(t(...i)), s);
  return n._c = !1, n;
}, Ji = (e, t, s) => {
  const n = e._ctx;
  for (const i in e) {
    if (bn(i)) continue;
    const l = e[i];
    if (N(l))
      t[i] = Dl(i, l, n);
    else if (l != null) {
      const o = yn(l);
      t[i] = () => o;
    }
  }
}, Yi = (e, t) => {
  const s = yn(t);
  e.slots.default = () => s;
}, Xi = (e, t, s) => {
  for (const n in t)
    (s || !bn(n)) && (e[n] = t[n]);
}, Kl = (e, t, s) => {
  const n = e.slots = Bi();
  if (e.vnode.shapeFlag & 32) {
    const i = t._;
    i ? (Xi(n, t, s), s && ai(n, "_", i, !0)) : Ji(t, n);
  } else t && Yi(e, t);
}, Nl = (e, t, s) => {
  const { vnode: n, slots: i } = e;
  let l = !0, o = se;
  if (n.shapeFlag & 32) {
    const a = t._;
    a ? s && a === 1 ? l = !1 : Xi(i, t, s) : (l = !t.$stable, Ji(t, i)), o = t;
  } else t && (Yi(e, t), o = { default: 1 });
  if (l)
    for (const a in i)
      !bn(a) && o[a] == null && delete i[a];
}, Se = zl;
function Hl(e) {
  return Vl(e);
}
function Vl(e, t) {
  const s = Ss();
  s.__VUE__ = !0;
  const {
    insert: n,
    remove: i,
    patchProp: l,
    createElement: o,
    createText: a,
    createComment: u,
    setText: f,
    setElementText: d,
    parentNode: g,
    nextSibling: h,
    setScopeId: O = We,
    insertStaticContent: V
  } = e, j = (c, p, b, k = null, S = null, w = null, A = void 0, R = null, $ = !!p.dynamicChildren) => {
    if (c === p)
      return;
    c && !xt(c, p) && (k = mt(c), Ae(c, S, w, !0), c = null), p.patchFlag === -2 && ($ = !1, p.dynamicChildren = null);
    const { type: C, ref: L, shapeFlag: E } = p;
    switch (C) {
      case _s:
        B(c, p, b, k);
        break;
      case it:
        W(c, p, b, k);
        break;
      case Ks:
        c == null && D(p, b, k, A);
        break;
      case G:
        Ie(
          c,
          p,
          b,
          k,
          S,
          w,
          A,
          R,
          $
        );
        break;
      default:
        E & 1 ? P(
          c,
          p,
          b,
          k,
          S,
          w,
          A,
          R,
          $
        ) : E & 6 ? bt(
          c,
          p,
          b,
          k,
          S,
          w,
          A,
          R,
          $
        ) : (E & 64 || E & 128) && C.process(
          c,
          p,
          b,
          k,
          S,
          w,
          A,
          R,
          $,
          rt
        );
    }
    L != null && S ? Kt(L, c && c.ref, w, p || c, !p) : L == null && c && c.ref != null && Kt(c.ref, null, w, c, !0);
  }, B = (c, p, b, k) => {
    if (c == null)
      n(
        p.el = a(p.children),
        b,
        k
      );
    else {
      const S = p.el = c.el;
      p.children !== c.children && f(S, p.children);
    }
  }, W = (c, p, b, k) => {
    c == null ? n(
      p.el = u(p.children || ""),
      b,
      k
    ) : p.el = c.el;
  }, D = (c, p, b, k) => {
    [c.el, c.anchor] = V(
      c.children,
      p,
      b,
      k,
      c.el,
      c.anchor
    );
  }, _ = ({ el: c, anchor: p }, b, k) => {
    let S;
    for (; c && c !== p; )
      S = h(c), n(c, b, k), c = S;
    n(p, b, k);
  }, T = ({ el: c, anchor: p }) => {
    let b;
    for (; c && c !== p; )
      b = h(c), i(c), c = b;
    i(p);
  }, P = (c, p, b, k, S, w, A, R, $) => {
    if (p.type === "svg" ? A = "svg" : p.type === "math" && (A = "mathml"), c == null)
      H(
        p,
        b,
        k,
        S,
        w,
        A,
        R,
        $
      );
    else {
      const C = c.el && c.el._isVueCE ? c.el : null;
      try {
        C && C._beginPatch(), le(
          c,
          p,
          S,
          w,
          A,
          R,
          $
        );
      } finally {
        C && C._endPatch();
      }
    }
  }, H = (c, p, b, k, S, w, A, R) => {
    let $, C;
    const { props: L, shapeFlag: E, transition: x, dirs: m } = c;
    if ($ = c.el = o(
      c.type,
      w,
      L && L.is,
      L
    ), E & 8 ? d($, c.children) : E & 16 && ue(
      c.children,
      $,
      null,
      k,
      S,
      Ds(c, w),
      A,
      R
    ), m && at(c, null, k, "created"), X($, c, c.scopeId, A, k), L) {
      for (const z in L)
        z !== "value" && !Ft(z) && l($, z, null, L[z], w, k);
      "value" in L && l($, "value", null, L.value, w), (C = L.onVnodeBeforeMount) && De(C, k, c);
    }
    m && at(c, null, k, "beforeMount");
    const K = Wl(S, x);
    K && x.beforeEnter($), n($, p, b), ((C = L && L.onVnodeMounted) || K || m) && Se(() => {
      try {
        C && De(C, k, c), K && x.enter($), m && at(c, null, k, "mounted");
      } finally {
      }
    }, S);
  }, X = (c, p, b, k, S) => {
    if (b && O(c, b), k)
      for (let w = 0; w < k.length; w++)
        O(c, k[w]);
    if (S) {
      let w = S.subTree;
      if (p === w || to(w.type) && (w.ssContent === p || w.ssFallback === p)) {
        const A = S.vnode;
        X(
          c,
          A,
          A.scopeId,
          A.slotScopeIds,
          S.parent
        );
      }
    }
  }, ue = (c, p, b, k, S, w, A, R, $ = 0) => {
    for (let C = $; C < c.length; C++) {
      const L = c[C] = R ? Ze(c[C]) : He(c[C]);
      j(
        null,
        L,
        p,
        b,
        k,
        S,
        w,
        A,
        R
      );
    }
  }, le = (c, p, b, k, S, w, A) => {
    const R = p.el = c.el;
    let { patchFlag: $, dynamicChildren: C, dirs: L } = p;
    $ |= c.patchFlag & 16;
    const E = c.props || se, x = p.props || se;
    let m;
    if (b && ut(b, !1), (m = x.onVnodeBeforeUpdate) && De(m, b, p, c), L && at(p, c, b, "beforeUpdate"), b && ut(b, !0), // #6385 the old vnode may be a user-wrapped non-isomorphic block
    // Force full diff when block metadata is unstable.
    C && (!c.dynamicChildren || c.dynamicChildren.length !== C.length) && ($ = 0, A = !1, C = null), (E.innerHTML && x.innerHTML == null || E.textContent && x.textContent == null) && d(R, ""), C ? ke(
      c.dynamicChildren,
      C,
      R,
      b,
      k,
      Ds(p, S),
      w
    ) : A || Q(
      c,
      p,
      R,
      null,
      b,
      k,
      Ds(p, S),
      w,
      !1
    ), $ > 0) {
      if ($ & 16)
        Le(R, E, x, b, S);
      else if ($ & 2 && E.class !== x.class && l(R, "class", null, x.class, S), $ & 4 && l(R, "style", E.style, x.style, S), $ & 8) {
        const K = p.dynamicProps;
        for (let z = 0; z < K.length; z++) {
          const q = K[z], oe = E[q], ae = x[q];
          (ae !== oe || q === "value") && l(R, q, oe, ae, S, b);
        }
      }
      $ & 1 && c.children !== p.children && d(R, p.children);
    } else !A && C == null && Le(R, E, x, b, S);
    ((m = x.onVnodeUpdated) || L) && Se(() => {
      m && De(m, b, p, c), L && at(p, c, b, "updated");
    }, k);
  }, ke = (c, p, b, k, S, w, A) => {
    for (let R = 0; R < p.length; R++) {
      const $ = c[R], C = p[R], L = (
        // oldVNode may be an errored async setup() component inside Suspense
        // which will not have a mounted element
        $.el && // - In the case of a Fragment, we need to provide the actual parent
        // of the Fragment itself so it can move its children.
        ($.type === G || // - In the case of different nodes, there is going to be a replacement
        // which also requires the correct parent container
        !xt($, C) || // - In the case of a component, it could contain anything.
        $.shapeFlag & 198) ? g($.el) : (
          // In other cases, the parent container is not actually used so we
          // just pass the block element here to avoid a DOM parentNode call.
          b
        )
      );
      j(
        $,
        C,
        L,
        null,
        k,
        S,
        w,
        A,
        !0
      );
    }
  }, Le = (c, p, b, k, S) => {
    if (p !== b) {
      if (p !== se)
        for (const w in p)
          !Ft(w) && !(w in b) && l(
            c,
            w,
            p[w],
            null,
            S,
            k
          );
      for (const w in b) {
        if (Ft(w)) continue;
        const A = b[w], R = p[w];
        A !== R && w !== "value" && l(c, w, R, A, S, k);
      }
      "value" in b && l(c, "value", p.value, b.value, S);
    }
  }, Ie = (c, p, b, k, S, w, A, R, $) => {
    const C = p.el = c ? c.el : a(""), L = p.anchor = c ? c.anchor : a("");
    let { patchFlag: E, dynamicChildren: x, slotScopeIds: m } = p;
    m && (R = R ? R.concat(m) : m), c == null ? (n(C, b, k), n(L, b, k), ue(
      // #10007
      // such fragment like `<></>` will be compiled into
      // a fragment which doesn't have a children.
      // In this case fallback to an empty array
      p.children || [],
      b,
      L,
      S,
      w,
      A,
      R,
      $
    )) : E > 0 && E & 64 && x && // #2715 the previous fragment could've been a BAILed one as a result
    // of renderSlot() with no valid children
    c.dynamicChildren && c.dynamicChildren.length === x.length ? (ke(
      c.dynamicChildren,
      x,
      b,
      S,
      w,
      A,
      R
    ), // #2080 if the stable fragment has a key, it's a <template v-for> that may
    //  get moved around. Make sure all root level vnodes inherit el.
    // #2134 or if it's a component root, it may also get moved around
    // as the component is being moved.
    (p.key != null || S && p === S.subTree) && Zi(
      c,
      p,
      !0
      /* shallow */
    )) : Q(
      c,
      p,
      b,
      L,
      S,
      w,
      A,
      R,
      $
    );
  }, bt = (c, p, b, k, S, w, A, R, $) => {
    p.slotScopeIds = R, c == null ? p.shapeFlag & 512 ? S.ctx.activate(
      p,
      b,
      k,
      A,
      $
    ) : yt(
      p,
      b,
      k,
      S,
      w,
      A,
      $
    ) : es(c, p, $);
  }, yt = (c, p, b, k, S, w, A) => {
    const R = c.component = Ql(
      c,
      k,
      S
    );
    if (Li(c) && (R.ctx.renderer = rt), tr(R, !1, A), R.asyncDep) {
      if (S && S.registerDep(R, ce, A), !c.el) {
        const $ = R.subTree = xe(it);
        W(null, $, p, b), c.placeholder = $.el;
      }
    } else
      ce(
        R,
        c,
        p,
        b,
        S,
        w,
        A
      );
  }, es = (c, p, b) => {
    const k = p.component = c.component;
    if (jl(c, p, b))
      if (k.asyncDep && !k.asyncResolved) {
        ie(k, p, b);
        return;
      } else
        k.next = p, k.update();
    else
      p.el = c.el, k.vnode = p;
  }, ce = (c, p, b, k, S, w, A) => {
    const R = () => {
      if (c.isMounted) {
        let { next: E, bu: x, u: m, parent: K, vnode: z } = c;
        {
          const Fe = Qi(c);
          if (Fe) {
            E && (E.el = z.el, ie(c, E, A)), Fe.asyncDep.then(() => {
              Se(() => {
                c.isUnmounted || C();
              }, S);
            });
            return;
          }
        }
        let q = E, oe;
        ut(c, !1), E ? (E.el = z.el, ie(c, E, A)) : E = z, x && ls(x), (oe = E.props && E.props.onVnodeBeforeUpdate) && De(oe, K, E, z), ut(c, !0);
        const ae = jn(c), Ce = c.subTree;
        c.subTree = ae, j(
          Ce,
          ae,
          // parent may have changed if it's in a teleport
          g(Ce.el),
          // anchor may have changed if it's in a fragment
          mt(Ce),
          c,
          S,
          w
        ), E.el = ae.el, q === null && Ml(c, ae.el), m && Se(m, S), (oe = E.props && E.props.onVnodeUpdated) && Se(
          () => De(oe, K, E, z),
          S
        );
      } else {
        let E;
        const { el: x, props: m } = p, { bm: K, m: z, parent: q, root: oe, type: ae } = c, Ce = Nt(p);
        ut(c, !1), K && ls(K), !Ce && (E = m && m.onVnodeBeforeMount) && De(E, q, p), ut(c, !0);
        {
          oe.ce && oe.ce._hasShadowRoot() && oe.ce._injectChildStyle(
            ae,
            c.parent ? c.parent.type : void 0
          );
          const Fe = c.subTree = jn(c);
          j(
            null,
            Fe,
            b,
            k,
            c,
            S,
            w
          ), p.el = Fe.el;
        }
        if (z && Se(z, S), !Ce && (E = m && m.onVnodeMounted)) {
          const Fe = p;
          Se(
            () => De(E, q, Fe),
            S
          );
        }
        (p.shapeFlag & 256 || q && Nt(q.vnode) && q.vnode.shapeFlag & 256) && c.a && Se(c.a, S), c.isMounted = !0, p = b = k = null;
      }
    };
    c.scope.on();
    const $ = c.effect = new pi(R);
    c.scope.off();
    const C = c.update = $.run.bind($), L = c.job = $.runIfDirty.bind($);
    L.i = c, L.id = c.uid, $.scheduler = () => pn(L), ut(c, !0), C();
  }, ie = (c, p, b) => {
    p.component = c;
    const k = c.vnode.props;
    c.vnode = p, c.next = null, Fl(c, p.props, k, b), Nl(c, p.children, b), ze(), Rn(c), qe();
  }, Q = (c, p, b, k, S, w, A, R, $ = !1) => {
    const C = c && c.children, L = c ? c.shapeFlag : 0, E = p.children, { patchFlag: x, shapeFlag: m } = p;
    if (x > 0) {
      if (x & 128) {
        vt(
          C,
          E,
          b,
          k,
          S,
          w,
          A,
          R,
          $
        );
        return;
      } else if (x & 256) {
        Ge(
          C,
          E,
          b,
          k,
          S,
          w,
          A,
          R,
          $
        );
        return;
      }
    }
    m & 8 ? (L & 16 && lt(C, S, w), E !== C && d(b, E)) : L & 16 ? m & 16 ? vt(
      C,
      E,
      b,
      k,
      S,
      w,
      A,
      R,
      $
    ) : lt(C, S, w, !0) : (L & 8 && d(b, ""), m & 16 && ue(
      E,
      b,
      k,
      S,
      w,
      A,
      R,
      $
    ));
  }, Ge = (c, p, b, k, S, w, A, R, $) => {
    c = c || kt, p = p || kt;
    const C = c.length, L = p.length, E = Math.min(C, L);
    let x;
    for (x = 0; x < E; x++) {
      const m = p[x] = $ ? Ze(p[x]) : He(p[x]);
      j(
        c[x],
        m,
        b,
        null,
        S,
        w,
        A,
        R,
        $
      );
    }
    C > L ? lt(
      c,
      S,
      w,
      !0,
      !1,
      E
    ) : ue(
      p,
      b,
      k,
      S,
      w,
      A,
      R,
      $,
      E
    );
  }, vt = (c, p, b, k, S, w, A, R, $) => {
    let C = 0;
    const L = p.length;
    let E = c.length - 1, x = L - 1;
    for (; C <= E && C <= x; ) {
      const m = c[C], K = p[C] = $ ? Ze(p[C]) : He(p[C]);
      if (xt(m, K))
        j(
          m,
          K,
          b,
          null,
          S,
          w,
          A,
          R,
          $
        );
      else
        break;
      C++;
    }
    for (; C <= E && C <= x; ) {
      const m = c[E], K = p[x] = $ ? Ze(p[x]) : He(p[x]);
      if (xt(m, K))
        j(
          m,
          K,
          b,
          null,
          S,
          w,
          A,
          R,
          $
        );
      else
        break;
      E--, x--;
    }
    if (C > E) {
      if (C <= x) {
        const m = x + 1, K = m < L ? p[m].el : k;
        for (; C <= x; )
          j(
            null,
            p[C] = $ ? Ze(p[C]) : He(p[C]),
            b,
            K,
            S,
            w,
            A,
            R,
            $
          ), C++;
      }
    } else if (C > x)
      for (; C <= E; )
        Ae(c[C], S, w, !0), C++;
    else {
      const m = C, K = C, z = /* @__PURE__ */ new Map();
      for (C = K; C <= x; C++) {
        const Te = p[C] = $ ? Ze(p[C]) : He(p[C]);
        Te.key != null && z.set(Te.key, C);
      }
      let q, oe = 0;
      const ae = x - K + 1;
      let Ce = !1, Fe = 0;
      const Ot = new Array(ae);
      for (C = 0; C < ae; C++) Ot[C] = 0;
      for (C = m; C <= E; C++) {
        const Te = c[C];
        if (oe >= ae) {
          Ae(Te, S, w, !0);
          continue;
        }
        let Ue;
        if (Te.key != null)
          Ue = z.get(Te.key);
        else
          for (q = K; q <= x; q++)
            if (Ot[q - K] === 0 && xt(Te, p[q])) {
              Ue = q;
              break;
            }
        Ue === void 0 ? Ae(Te, S, w, !0) : (Ot[Ue - K] = C + 1, Ue >= Fe ? Fe = Ue : Ce = !0, j(
          Te,
          p[Ue],
          b,
          null,
          S,
          w,
          A,
          R,
          $
        ), oe++);
      }
      const mn = Ce ? Bl(Ot) : kt;
      for (q = mn.length - 1, C = ae - 1; C >= 0; C--) {
        const Te = K + C, Ue = p[Te], wn = p[Te + 1], Cn = Te + 1 < L ? (
          // #13559, #14173 fallback to el placeholder for unresolved async component
          wn.el || eo(wn)
        ) : k;
        Ot[C] === 0 ? j(
          null,
          Ue,
          b,
          Cn,
          S,
          w,
          A,
          R,
          $
        ) : Ce && (q < 0 || C !== mn[q] ? Je(Ue, b, Cn, 2) : q--);
      }
    }
  }, Je = (c, p, b, k, S = null) => {
    const { el: w, type: A, transition: R, children: $, shapeFlag: C } = c;
    if (C & 6) {
      Je(c.component.subTree, p, b, k);
      return;
    }
    if (C & 128) {
      c.suspense.move(p, b, k);
      return;
    }
    if (C & 64) {
      A.move(c, p, b, rt);
      return;
    }
    if (A === G) {
      n(w, p, b);
      for (let E = 0; E < $.length; E++)
        Je($[E], p, b, k);
      n(c.anchor, p, b);
      return;
    }
    if (A === Ks) {
      _(c, p, b);
      return;
    }
    if (k !== 2 && C & 1 && R)
      if (k === 0)
        R.persisted && !w[Fs] ? n(w, p, b) : (R.beforeEnter(w), n(w, p, b), Se(() => R.enter(w), S));
      else {
        const { leave: E, delayLeave: x, afterLeave: m } = R, K = () => {
          c.ctx.isUnmounted ? i(w) : n(w, p, b);
        }, z = () => {
          const q = w._isLeaving || !!w[Fs];
          w._isLeaving && w[Fs](
            !0
            /* cancelled */
          ), R.persisted && !q ? K() : E(w, () => {
            K(), m && m();
          });
        };
        x ? x(w, K, z) : z();
      }
    else
      n(w, p, b);
  }, Ae = (c, p, b, k = !1, S = !1) => {
    const {
      type: w,
      props: A,
      ref: R,
      children: $,
      dynamicChildren: C,
      shapeFlag: L,
      patchFlag: E,
      dirs: x,
      cacheIndex: m,
      memo: K
    } = c;
    if (E === -2 && (S = !1), R != null && (ze(), Kt(R, null, b, c, !0), qe()), m != null && (p.renderCache[m] = void 0), L & 256) {
      p.ctx.deactivate(c);
      return;
    }
    const z = L & 1 && x, q = !Nt(c);
    let oe;
    if (q && (oe = A && A.onVnodeBeforeUnmount) && De(oe, p, c), L & 6)
      Es(c.component, b, k);
    else {
      if (L & 128) {
        c.suspense.unmount(b, k);
        return;
      }
      z && at(c, null, p, "beforeUnmount"), L & 64 ? c.type.remove(
        c,
        p,
        b,
        rt,
        k
      ) : C && // #5154
      // when v-once is used inside a block, setBlockTracking(-1) marks the
      // parent block with hasOnce: true
      // so that it doesn't take the fast path during unmount - otherwise
      // components nested in v-once are never unmounted.
      !C.hasOnce && // #1153: fast path should not be taken for non-stable (v-for) fragments
      (w !== G || E > 0 && E & 64) ? lt(
        C,
        p,
        b,
        !1,
        !0
      ) : (w === G && E & 384 || !S && L & 16) && lt($, p, b), k && ts(c);
    }
    const ae = K != null && m == null;
    (q && (oe = A && A.onVnodeUnmounted) || z || ae) && Se(() => {
      oe && De(oe, p, c), z && at(c, null, p, "unmounted"), ae && (c.el = null);
    }, b);
  }, ts = (c) => {
    const { type: p, el: b, anchor: k, transition: S } = c;
    if (p === G) {
      As(b, k);
      return;
    }
    if (p === Ks) {
      T(c);
      return;
    }
    const w = () => {
      i(b), S && !S.persisted && S.afterLeave && S.afterLeave();
    };
    if (c.shapeFlag & 1 && S && !S.persisted) {
      const { leave: A, delayLeave: R } = S, $ = () => A(b, w);
      R ? R(c.el, w, $) : $();
    } else
      w();
  }, As = (c, p) => {
    let b;
    for (; c !== p; )
      b = h(c), i(c), c = b;
    i(p);
  }, Es = (c, p, b) => {
    const { bum: k, scope: S, job: w, subTree: A, um: R, m: $, a: C } = c;
    Fn($), Fn(C), k && ls(k), S.stop(), w && (w.flags |= 8, Ae(A, c, p, b)), R && Se(R, p), Se(() => {
      c.isUnmounted = !0;
    }, p);
  }, lt = (c, p, b, k = !1, S = !1, w = 0) => {
    for (let A = w; A < c.length; A++)
      Ae(c[A], p, b, k, S);
  }, mt = (c) => {
    if (c.shapeFlag & 6)
      return mt(c.component.subTree);
    if (c.shapeFlag & 128)
      return c.suspense.next();
    const p = h(c.anchor || c.el), b = p && p[ol];
    return b ? h(b) : p;
  };
  let Et = !1;
  const ss = (c, p, b) => {
    let k;
    c == null ? p._vnode && (Ae(p._vnode, null, null, !0), k = p._vnode.component) : j(
      p._vnode || null,
      c,
      p,
      null,
      null,
      null,
      b
    ), p._vnode = c, Et || (Et = !0, Rn(k), Ei(), Et = !1);
  }, rt = {
    p: j,
    um: Ae,
    m: Je,
    r: ts,
    mt: yt,
    mc: ue,
    pc: Q,
    pbc: ke,
    n: mt,
    o: e
  };
  return {
    render: ss,
    hydrate: void 0,
    createApp: Il(ss)
  };
}
function Ds({ type: e, props: t }, s) {
  return s === "svg" && e === "foreignObject" || s === "mathml" && e === "annotation-xml" && t && t.encoding && t.encoding.includes("html") ? void 0 : s;
}
function ut({ effect: e, job: t }, s) {
  s ? (e.flags |= 32, t.flags |= 4) : (e.flags &= -33, t.flags &= -5);
}
function Wl(e, t) {
  return (!e || e && !e.pendingBranch) && t && !t.persisted;
}
function Zi(e, t, s = !1) {
  const n = e.children, i = t.children;
  if (F(n) && F(i))
    for (let l = 0; l < n.length; l++) {
      const o = n[l];
      let a = i[l];
      a.shapeFlag & 1 && !a.dynamicChildren && ((a.patchFlag <= 0 || a.patchFlag === 32) && (a = i[l] = Ze(i[l]), a.el = o.el), !s && a.patchFlag !== -2 && Zi(o, a)), a.type === _s && (a.patchFlag === -1 && (a = i[l] = Ze(a)), a.el = o.el), a.type === it && !a.el && (a.el = o.el);
    }
}
function Bl(e) {
  const t = e.slice(), s = [0];
  let n, i, l, o, a;
  const u = e.length;
  for (n = 0; n < u; n++) {
    const f = e[n];
    if (f !== 0) {
      if (i = s[s.length - 1], e[i] < f) {
        t[n] = i, s.push(n);
        continue;
      }
      for (l = 0, o = s.length - 1; l < o; )
        a = l + o >> 1, e[s[a]] < f ? l = a + 1 : o = a;
      f < e[s[l]] && (l > 0 && (t[n] = s[l - 1]), s[l] = n);
    }
  }
  for (l = s.length, o = s[l - 1]; l-- > 0; )
    s[l] = o, o = t[o];
  return s;
}
function Qi(e) {
  const t = e.subTree.component;
  if (t)
    return t.asyncDep && !t.asyncResolved ? t : Qi(t);
}
function Fn(e) {
  if (e)
    for (let t = 0; t < e.length; t++)
      e[t].flags |= 8;
}
function eo(e) {
  if (e.placeholder)
    return e.placeholder;
  const t = e.component;
  return t ? eo(t.subTree) : null;
}
const to = (e) => e.__isSuspense;
function zl(e, t) {
  t && t.pendingBranch ? F(e) ? t.effects.push(...e) : t.effects.push(e) : Qo(e);
}
const G = /* @__PURE__ */ Symbol.for("v-fgt"), _s = /* @__PURE__ */ Symbol.for("v-txt"), it = /* @__PURE__ */ Symbol.for("v-cmt"), Ks = /* @__PURE__ */ Symbol.for("v-stc"), Vt = [];
let _e = null;
function y(e = !1) {
  Vt.push(_e = e ? null : []);
}
function ql() {
  Vt.pop(), _e = Vt[Vt.length - 1] || null;
}
let qt = 1;
function Un(e, t = !1) {
  qt += e, e < 0 && _e && t && (_e.hasOnce = !0);
}
function so(e) {
  return e.dynamicChildren = qt > 0 ? _e || kt : null, ql(), qt > 0 && _e && _e.push(e), e;
}
function v(e, t, s, n, i, l) {
  return so(
    r(
      e,
      t,
      s,
      n,
      i,
      l,
      !0
    )
  );
}
function Mt(e, t, s, n, i) {
  return so(
    xe(
      e,
      t,
      s,
      n,
      i,
      !0
    )
  );
}
function no(e) {
  return e ? e.__v_isVNode === !0 : !1;
}
function xt(e, t) {
  return e.type === t.type && e.key === t.key;
}
const io = ({ key: e }) => e ?? null, as = ({
  ref: e,
  ref_key: t,
  ref_for: s
}) => (typeof e == "number" && (e = "" + e), e != null ? re(e) || /* @__PURE__ */ be(e) || N(e) ? { i: Re, r: e, k: t, f: !!s } : e : null);
function r(e, t = null, s = null, n = 0, i = null, l = e === G ? 0 : 1, o = !1, a = !1) {
  const u = {
    __v_isVNode: !0,
    __v_skip: !0,
    type: e,
    props: t,
    key: t && io(t),
    ref: t && as(t),
    scopeId: Pi,
    slotScopeIds: null,
    children: s,
    component: null,
    suspense: null,
    ssContent: null,
    ssFallback: null,
    dirs: null,
    transition: null,
    el: null,
    anchor: null,
    target: null,
    targetStart: null,
    targetAnchor: null,
    staticCount: 0,
    shapeFlag: l,
    patchFlag: n,
    dynamicProps: i,
    dynamicChildren: null,
    appContext: null,
    ctx: Re
  };
  return a ? (hs(u, s), l & 128 && e.normalize(u)) : s && (u.shapeFlag |= re(s) ? 8 : 16), qt > 0 && // avoid a block node from tracking itself
  !o && // has current parent block
  _e && // presence of a patch flag indicates this node needs patching on updates.
  // component nodes also should always be patched, because even if the
  // component doesn't need to update, it needs to persist the instance on to
  // the next vnode so that it can be properly unmounted later.
  (u.patchFlag > 0 || l & 6) && // the EVENTS flag is only for hydration and if it is the only flag, the
  // vnode should not be considered dynamic due to handler caching.
  u.patchFlag !== 32 && _e.push(u), u;
}
const xe = Gl;
function Gl(e, t = null, s = null, n = 0, i = null, l = !1) {
  if ((!e || e === ml) && (e = it), no(e)) {
    const a = At(
      e,
      t,
      !0
      /* mergeRef: true */
    );
    return s && hs(a, s), qt > 0 && !l && _e && (a.shapeFlag & 6 ? _e[_e.indexOf(e)] = a : _e.push(a)), a.patchFlag = -2, a;
  }
  if (lr(e) && (e = e.__vccOpts), t) {
    t = Jl(t);
    let { class: a, style: u } = t;
    a && !re(a) && (t.class = ee(a)), te(u) && (/* @__PURE__ */ dn(u) && !F(u) && (u = pe({}, u)), t.style = Yt(u));
  }
  const o = re(e) ? 1 : to(e) ? 128 : ll(e) ? 64 : te(e) ? 4 : N(e) ? 2 : 0;
  return r(
    e,
    t,
    s,
    n,
    i,
    o,
    l,
    !0
  );
}
function Jl(e) {
  return e ? /* @__PURE__ */ dn(e) || zi(e) ? pe({}, e) : e : null;
}
function At(e, t, s = !1, n = !1) {
  const { props: i, ref: l, patchFlag: o, children: a, transition: u } = e, f = t ? Yl(i || {}, t) : i, d = {
    __v_isVNode: !0,
    __v_skip: !0,
    type: e.type,
    props: f,
    key: f && io(f),
    ref: t && t.ref ? (
      // #2078 in the case of <component :is="vnode" ref="extra"/>
      // if the vnode itself already has a ref, cloneVNode will need to merge
      // the refs so the single vnode can be set on multiple refs
      s && l ? F(l) ? l.concat(as(t)) : [l, as(t)] : as(t)
    ) : l,
    scopeId: e.scopeId,
    slotScopeIds: e.slotScopeIds,
    children: a,
    target: e.target,
    targetStart: e.targetStart,
    targetAnchor: e.targetAnchor,
    staticCount: e.staticCount,
    shapeFlag: e.shapeFlag,
    // if the vnode is cloned with extra props, we can no longer assume its
    // existing patch flag to be reliable and need to add the FULL_PROPS flag.
    // note: preserve flag for fragments since they use the flag for children
    // fast paths only.
    patchFlag: t && e.type !== G ? o === -1 ? 16 : o | 16 : o,
    dynamicProps: e.dynamicProps,
    dynamicChildren: e.dynamicChildren,
    appContext: e.appContext,
    dirs: e.dirs,
    transition: u,
    // These should technically only be non-null on mounted VNodes. However,
    // they *should* be copied for kept-alive vnodes. So we just always copy
    // them since them being non-null during a mount doesn't affect the logic as
    // they will simply be overwritten.
    component: e.component,
    suspense: e.suspense,
    ssContent: e.ssContent && At(e.ssContent),
    ssFallback: e.ssFallback && At(e.ssFallback),
    placeholder: e.placeholder,
    el: e.el,
    anchor: e.anchor,
    ctx: e.ctx,
    ce: e.ce
  };
  return u && n && hn(
    d,
    u.clone(d)
  ), d;
}
function I(e = " ", t = 0) {
  return xe(_s, null, e, t);
}
function U(e = "", t = !1) {
  return t ? (y(), Mt(it, null, e)) : xe(it, null, e);
}
function He(e) {
  return e == null || typeof e == "boolean" ? xe(it) : F(e) ? xe(
    G,
    null,
    // #3666, avoid reference pollution when reusing vnode
    e.slice()
  ) : no(e) ? Ze(e) : xe(_s, null, String(e));
}
function Ze(e) {
  return e.el === null && e.patchFlag !== -1 || e.memo ? e : At(e);
}
function hs(e, t) {
  let s = 0;
  const { shapeFlag: n } = e;
  if (t == null)
    t = null;
  else if (F(t))
    s = 16;
  else if (typeof t == "object")
    if (n & 65) {
      const i = t.default;
      i && (i._c && (i._d = !1), hs(e, i()), i._c && (i._d = !0));
      return;
    } else {
      s = 32;
      const i = t._;
      !i && !zi(t) ? t._ctx = Re : i === 3 && Re && (Re.slots._ === 1 ? t._ = 1 : (t._ = 2, e.patchFlag |= 1024));
    }
  else if (N(t)) {
    if (n & 65) {
      hs(e, { default: t });
      return;
    }
    t = { default: t, _ctx: Re }, s = 32;
  } else
    t = String(t), n & 64 ? (s = 16, t = [I(t)]) : s = 8;
  e.children = t, e.shapeFlag |= s;
}
function Yl(...e) {
  const t = {};
  for (let s = 0; s < e.length; s++) {
    const n = e[s];
    for (const i in n)
      if (i === "class")
        t.class !== n.class && (t.class = ee([t.class, n.class]));
      else if (i === "style")
        t.style = Yt([t.style, n.style]);
      else if (ys(i)) {
        const l = t[i], o = n[i];
        o && l !== o && !(F(l) && l.includes(o)) ? t[i] = l ? [].concat(l, o) : o : o == null && l == null && // mergeProps({ 'onUpdate:modelValue': undefined }) should not retain
        // the model listener.
        !vs(i) && (t[i] = o);
      } else i !== "" && (t[i] = n[i]);
  }
  return t;
}
function De(e, t, s, n = null) {
  Me(e, t, 7, [
    s,
    n
  ]);
}
const Xl = Ni();
let Zl = 0;
function Ql(e, t, s) {
  const n = e.type, i = (t ? t.appContext : e.appContext) || Xl, l = {
    uid: Zl++,
    vnode: e,
    type: n,
    parent: t,
    appContext: i,
    root: null,
    // to be immediately set
    next: null,
    subTree: null,
    // will be set synchronously right after creation
    effect: null,
    update: null,
    // will be set synchronously right after creation
    job: null,
    scope: new Co(
      !0
      /* detached */
    ),
    render: null,
    proxy: null,
    exposed: null,
    exposeProxy: null,
    withProxy: null,
    provides: t ? t.provides : Object.create(i.provides),
    ids: t ? t.ids : ["", 0, 0],
    accessCache: null,
    renderCache: [],
    // local resolved assets
    components: null,
    directives: null,
    // resolved props and emits options
    propsOptions: Gi(n, i),
    emitsOptions: Hi(n, i),
    // emit
    emit: null,
    // to be set immediately
    emitted: null,
    // props default value
    propsDefaults: se,
    // inheritAttrs
    inheritAttrs: n.inheritAttrs,
    // state
    ctx: se,
    data: se,
    props: se,
    attrs: se,
    slots: se,
    refs: se,
    setupState: se,
    setupContext: null,
    // suspense related
    suspense: s,
    suspenseId: s ? s.pendingId : 0,
    asyncDep: null,
    asyncResolved: !1,
    // lifecycle hooks
    // not using enums here because it results in computed properties
    isMounted: !1,
    isUnmounted: !1,
    isDeactivated: !1,
    bc: null,
    c: null,
    bm: null,
    m: null,
    bu: null,
    u: null,
    um: null,
    bum: null,
    da: null,
    a: null,
    rtg: null,
    rtc: null,
    ec: null,
    sp: null
  };
  return l.ctx = { _: l }, l.root = t ? t.root : l, l.emit = El.bind(null, l), e.ce && e.ce(l), l;
}
let ge = null;
const er = () => ge || Re;
let gs, Zs;
{
  const e = Ss(), t = (s, n) => {
    let i;
    return (i = e[s]) || (i = e[s] = []), i.push(n), (l) => {
      i.length > 1 ? i.forEach((o) => o(l)) : i[0](l);
    };
  };
  gs = t(
    "__VUE_INSTANCE_SETTERS__",
    (s) => ge = s
  ), Zs = t(
    "__VUE_SSR_SETTERS__",
    (s) => Gt = s
  );
}
const Qt = (e) => {
  const t = ge;
  return gs(e), e.scope.on(), () => {
    e.scope.off(), gs(t);
  };
}, Dn = () => {
  ge && ge.scope.off(), gs(null);
};
function oo(e) {
  return e.vnode.shapeFlag & 4;
}
let Gt = !1;
function tr(e, t = !1, s = !1) {
  t && Zs(t);
  const { props: n, children: i } = e.vnode, l = oo(e);
  Ll(e, n, l, t), Kl(e, i, s || t);
  const o = l ? sr(e, t) : void 0;
  return t && Zs(!1), o;
}
function sr(e, t) {
  const s = e.type;
  e.accessCache = /* @__PURE__ */ Object.create(null), e.proxy = new Proxy(e.ctx, Cl);
  const { setup: n } = s;
  if (n) {
    ze();
    const i = e.setupContext = n.length > 1 ? ir(e) : null, l = Qt(e), o = Zt(
      n,
      e,
      0,
      [
        e.props,
        i
      ]
    ), a = oi(o);
    if (qe(), l(), (a || e.sp) && !Nt(e) && Mi(e), a) {
      if (o.then(Dn, Dn), t)
        return o.then((u) => {
          Kn(e, u);
        }).catch((u) => {
          Ts(u, e, 0);
        });
      e.asyncDep = o;
    } else
      Kn(e, o);
  } else
    lo(e);
}
function Kn(e, t, s) {
  N(t) ? e.type.__ssrInlineRender ? e.ssrRender = t : e.render = t : te(t) && (e.setupState = _i(t)), lo(e);
}
function lo(e, t, s) {
  const n = e.type;
  e.render || (e.render = n.render || We);
  {
    const i = Qt(e);
    ze();
    try {
      Sl(e);
    } finally {
      qe(), i();
    }
  }
}
const nr = {
  get(e, t) {
    return he(e, "get", ""), e[t];
  }
};
function ir(e) {
  const t = (s) => {
    e.exposed = s || {};
  };
  return {
    attrs: new Proxy(e.attrs, nr),
    slots: e.slots,
    emit: e.emit,
    expose: t
  };
}
function Is(e) {
  return e.exposed ? e.exposeProxy || (e.exposeProxy = new Proxy(_i(No(e.exposed)), {
    get(t, s) {
      if (s in t)
        return t[s];
      if (s in Ht)
        return Ht[s](e);
    },
    has(t, s) {
      return s in t || s in Ht;
    }
  })) : e.proxy;
}
function or(e, t = !0) {
  return N(e) ? e.displayName || e.name : e.name || t && e.__name;
}
function lr(e) {
  return N(e) && "__vccOpts" in e;
}
const $e = (e, t) => /* @__PURE__ */ qo(e, t, Gt), rr = "3.5.39";
/**
* @vue/runtime-dom v3.5.39
* (c) 2018-present Yuxi (Evan) You and Vue contributors
* @license MIT
**/
let Qs;
const Nn = typeof window < "u" && window.trustedTypes;
if (Nn)
  try {
    Qs = /* @__PURE__ */ Nn.createPolicy("vue", {
      createHTML: (e) => e
    });
  } catch {
  }
const ro = Qs ? (e) => Qs.createHTML(e) : (e) => e, ar = "http://www.w3.org/2000/svg", ur = "http://www.w3.org/1998/Math/MathML", Xe = typeof document < "u" ? document : null, Hn = Xe && /* @__PURE__ */ Xe.createElement("template"), cr = {
  insert: (e, t, s) => {
    t.insertBefore(e, s || null);
  },
  remove: (e) => {
    const t = e.parentNode;
    t && t.removeChild(e);
  },
  createElement: (e, t, s, n) => {
    const i = t === "svg" ? Xe.createElementNS(ar, e) : t === "mathml" ? Xe.createElementNS(ur, e) : s ? Xe.createElement(e, { is: s }) : Xe.createElement(e);
    return e === "select" && n && n.multiple != null && i.setAttribute("multiple", n.multiple), i;
  },
  createText: (e) => Xe.createTextNode(e),
  createComment: (e) => Xe.createComment(e),
  setText: (e, t) => {
    e.nodeValue = t;
  },
  setElementText: (e, t) => {
    e.textContent = t;
  },
  parentNode: (e) => e.parentNode,
  nextSibling: (e) => e.nextSibling,
  querySelector: (e) => Xe.querySelector(e),
  setScopeId(e, t) {
    e.setAttribute(t, "");
  },
  // __UNSAFE__
  // Reason: innerHTML.
  // Static content here can only come from compiled templates.
  // As long as the user only uses trusted templates, this is safe.
  insertStaticContent(e, t, s, n, i, l) {
    const o = s ? s.previousSibling : t.lastChild;
    if (i && (i === l || i.nextSibling))
      for (; t.insertBefore(i.cloneNode(!0), s), !(i === l || !(i = i.nextSibling)); )
        ;
    else {
      Hn.innerHTML = ro(
        n === "svg" ? `<svg>${e}</svg>` : n === "mathml" ? `<math>${e}</math>` : e
      );
      const a = Hn.content;
      if (n === "svg" || n === "mathml") {
        const u = a.firstChild;
        for (; u.firstChild; )
          a.appendChild(u.firstChild);
        a.removeChild(u);
      }
      t.insertBefore(a, s);
    }
    return [
      // first
      o ? o.nextSibling : t.firstChild,
      // last
      s ? s.previousSibling : t.lastChild
    ];
  }
}, fr = /* @__PURE__ */ Symbol("_vtc");
function dr(e, t, s) {
  const n = e[fr];
  n && (t = (t ? [t, ...n] : [...n]).join(" ")), t == null ? e.removeAttribute("class") : s ? e.setAttribute("class", t) : e.className = t;
}
const Vn = /* @__PURE__ */ Symbol("_vod"), pr = /* @__PURE__ */ Symbol("_vsh"), hr = /* @__PURE__ */ Symbol(""), gr = /(?:^|;)\s*display\s*:/;
function br(e, t, s) {
  const n = e.style, i = re(s);
  let l = !1;
  if (s && !i) {
    if (t)
      if (re(t))
        for (const o of t.split(";")) {
          const a = o.slice(0, o.indexOf(":")).trim();
          s[a] == null && Lt(n, a, "");
        }
      else
        for (const o in t)
          s[o] == null && Lt(n, o, "");
    for (const o in s) {
      o === "display" && (l = !0);
      const a = s[o];
      a != null ? vr(
        e,
        o,
        !re(t) && t ? t[o] : void 0,
        a
      ) || Lt(n, o, a) : Lt(n, o, "");
    }
  } else if (i) {
    if (t !== s) {
      const o = n[hr];
      o && (s += ";" + o), n.cssText = s, l = gr.test(s);
    }
  } else t && e.removeAttribute("style");
  Vn in e && (e[Vn] = l ? n.display : "", e[pr] && (n.display = "none"));
}
const Wn = /\s*!important$/;
function Lt(e, t, s) {
  if (F(s))
    s.forEach((n) => Lt(e, t, n));
  else if (s == null && (s = ""), t.startsWith("--"))
    e.setProperty(t, s);
  else {
    const n = yr(e, t);
    Wn.test(s) ? e.setProperty(
      ot(n),
      s.replace(Wn, ""),
      "important"
    ) : e[n] = s;
  }
}
const Bn = ["Webkit", "Moz", "ms"], Ns = {};
function yr(e, t) {
  const s = Ns[t];
  if (s)
    return s;
  let n = we(t);
  if (n !== "filter" && n in e)
    return Ns[t] = n;
  n = Cs(n);
  for (let i = 0; i < Bn.length; i++) {
    const l = Bn[i] + n;
    if (l in e)
      return Ns[t] = l;
  }
  return t;
}
function vr(e, t, s, n) {
  return e.tagName === "TEXTAREA" && (t === "width" || t === "height") && re(n) && s === n;
}
const zn = "http://www.w3.org/1999/xlink";
function qn(e, t, s, n, i, l = mo(t)) {
  n && t.startsWith("xlink:") ? s == null ? e.removeAttributeNS(zn, t.slice(6, t.length)) : e.setAttributeNS(zn, t, s) : s == null || l && !ui(s) ? e.removeAttribute(t) : e.setAttribute(
    t,
    l ? "" : Be(s) ? String(s) : s
  );
}
function Gn(e, t, s, n, i) {
  if (t === "innerHTML" || t === "textContent") {
    s != null && (e[t] = t === "innerHTML" ? ro(s) : s);
    return;
  }
  const l = e.tagName;
  if (t === "value" && l !== "PROGRESS" && // custom elements may use _value internally
  !l.includes("-")) {
    const a = l === "OPTION" ? e.getAttribute("value") || "" : e.value, u = s == null ? (
      // #11647: value should be set as empty string for null and undefined,
      // but <input type="checkbox"> should be set as 'on'.
      e.type === "checkbox" ? "on" : ""
    ) : String(s);
    (a !== u || !("_value" in e)) && (e.value = u), s == null && e.removeAttribute(t), e._value = s;
    return;
  }
  let o = !1;
  if (s === "" || s == null) {
    const a = typeof e[t];
    a === "boolean" ? s = ui(s) : s == null && a === "string" ? (s = "", o = !0) : a === "number" && (s = 0, o = !0);
  }
  try {
    e[t] = s;
  } catch {
  }
  o && e.removeAttribute(i || t);
}
function ft(e, t, s, n) {
  e.addEventListener(t, s, n);
}
function mr(e, t, s, n) {
  e.removeEventListener(t, s, n);
}
const Jn = /* @__PURE__ */ Symbol("_vei");
function wr(e, t, s, n, i = null) {
  const l = e[Jn] || (e[Jn] = {}), o = l[t];
  if (n && o)
    o.value = n;
  else {
    const [a, u] = kr(t);
    if (n) {
      const f = l[t] = Rr(
        n,
        i
      );
      ft(e, a, f, u);
    } else o && (mr(e, a, o, u), l[t] = void 0);
  }
}
const Cr = /(Once|Passive|Capture)$/, Sr = /^on:?(?:Once|Passive|Capture)$/;
function kr(e) {
  let t, s;
  for (; (s = e.match(Cr)) && !Sr.test(e); )
    t || (t = {}), e = e.slice(0, e.length - s[1].length), t[s[1].toLowerCase()] = !0;
  return [e[2] === ":" ? e.slice(3) : ot(e.slice(2)), t];
}
let Hs = 0;
const Tr = /* @__PURE__ */ Promise.resolve(), $r = () => Hs || (Tr.then(() => Hs = 0), Hs = Date.now());
function Rr(e, t) {
  const s = (n) => {
    if (!n._vts)
      n._vts = Date.now();
    else if (n._vts <= s.attached)
      return;
    const i = s.value;
    if (F(i)) {
      const l = n.stopImmediatePropagation;
      n.stopImmediatePropagation = () => {
        l.call(n), n._stopped = !0;
      };
      const o = i.slice(), a = [n];
      for (let u = 0; u < o.length && !n._stopped; u++) {
        const f = o[u];
        f && Me(
          f,
          t,
          5,
          a
        );
      }
    } else
      Me(
        i,
        t,
        5,
        [n]
      );
  };
  return s.value = e, s.attached = $r(), s;
}
const Yn = (e) => e.charCodeAt(0) === 111 && e.charCodeAt(1) === 110 && // lowercase letter
e.charCodeAt(2) > 96 && e.charCodeAt(2) < 123, _r = (e, t, s, n, i, l) => {
  const o = i === "svg";
  t === "class" ? dr(e, n, o) : t === "style" ? br(e, s, n) : ys(t) ? vs(t) || wr(e, t, s, n, l) : (t[0] === "." ? (t = t.slice(1), !0) : t[0] === "^" ? (t = t.slice(1), !1) : Ir(e, t, n, o)) ? (Gn(e, t, n), !e.tagName.includes("-") && (t === "value" || t === "checked" || t === "selected") && qn(e, t, n, o, l, t !== "value")) : /* #11081 force set props for possible async custom element */ e._isVueCE && // #12408 check if it's declared prop or it's async custom element
  (Ar(e, t) || // @ts-expect-error _def is private
  e._def.__asyncLoader && (/[A-Z]/.test(t) || !re(n))) ? Gn(e, we(t), n, l, t) : (t === "true-value" ? e._trueValue = n : t === "false-value" && (e._falseValue = n), qn(e, t, n, o));
};
function Ir(e, t, s, n) {
  if (n)
    return !!(t === "innerHTML" || t === "textContent" || t in e && Yn(t) && N(s));
  if (t === "spellcheck" || t === "draggable" || t === "translate" || t === "autocorrect" || t === "sandbox" && e.tagName === "IFRAME" || t === "form" || t === "list" && e.tagName === "INPUT" || t === "type" && e.tagName === "TEXTAREA")
    return !1;
  if (t === "width" || t === "height") {
    const i = e.tagName;
    if (i === "IMG" || i === "VIDEO" || i === "CANVAS" || i === "SOURCE")
      return !1;
  }
  return Yn(t) && re(s) ? !1 : t in e;
}
function Ar(e, t) {
  const s = (
    // @ts-expect-error _def is private
    e._def.props
  );
  if (!s)
    return !1;
  const n = we(t);
  return Array.isArray(s) ? s.some((i) => we(i) === n) : Object.keys(s).some((i) => we(i) === n);
}
const bs = (e) => {
  const t = e.props["onUpdate:modelValue"] || !1;
  return F(t) ? (s) => ls(t, s) : t;
};
function Er(e) {
  e.target.composing = !0;
}
function Xn(e) {
  const t = e.target;
  t.composing && (t.composing = !1, t.dispatchEvent(new Event("input")));
}
const _t = /* @__PURE__ */ Symbol("_assign");
function Zn(e, t, s) {
  return t && (e = e.trim()), s && (e = nn(e)), e;
}
const ve = {
  created(e, { modifiers: { lazy: t, trim: s, number: n } }, i) {
    e[_t] = bs(i);
    const l = n || i.props && i.props.type === "number";
    ft(e, t ? "change" : "input", (o) => {
      o.target.composing || e[_t](Zn(e.value, s, l));
    }), (s || l) && ft(e, "change", () => {
      e.value = Zn(e.value, s, l);
    }), t || (ft(e, "compositionstart", Er), ft(e, "compositionend", Xn), ft(e, "change", Xn));
  },
  // set value on mounted so it's after min/max for type="range"
  mounted(e, { value: t }) {
    e.value = t ?? "";
  },
  beforeUpdate(e, { value: t, oldValue: s, modifiers: { lazy: n, trim: i, number: l } }, o) {
    if (e[_t] = bs(o), e.composing) return;
    const a = (l || e.type === "number") && !/^0\d/.test(e.value) ? nn(e.value) : e.value, u = t ?? "";
    if (a === u)
      return;
    const f = e.getRootNode();
    (f instanceof Document || f instanceof ShadowRoot) && f.activeElement === e && e.type !== "range" && (n && t === s || i && e.value.trim() === u) || (e.value = u);
  }
}, Qn = {
  // #4096 array checkboxes need to be deep traversed
  deep: !0,
  created(e, t, s) {
    e[_t] = bs(s), ft(e, "change", () => {
      const n = e._modelValue, i = Or(e), l = e.checked, o = e[_t];
      if (F(n)) {
        const a = ci(n, i), u = a !== -1;
        if (l && !u)
          o(n.concat(i));
        else if (!l && u) {
          const f = [...n];
          f.splice(a, 1), o(f);
        }
      } else if (ms(n)) {
        const a = new Set(n);
        l ? a.add(i) : a.delete(i), o(a);
      } else
        o(ao(e, l));
    });
  },
  // set initial checked on mount to wait for true-value/false-value
  mounted: ei,
  beforeUpdate(e, t, s) {
    e[_t] = bs(s), ei(e, t, s);
  }
};
function ei(e, { value: t, oldValue: s }, n) {
  e._modelValue = t;
  let i;
  if (F(t))
    i = ci(t, n.props.value) > -1;
  else if (ms(t))
    i = t.has(n.props.value);
  else {
    if (t === s) return;
    i = Xt(t, ao(e, !0));
  }
  e.checked !== i && (e.checked = i);
}
function Or(e) {
  return "_value" in e ? e._value : e.value;
}
function ao(e, t) {
  const s = t ? "_trueValue" : "_falseValue";
  return s in e ? e[s] : t;
}
const Pr = ["ctrl", "shift", "alt", "meta"], xr = {
  stop: (e) => e.stopPropagation(),
  prevent: (e) => e.preventDefault(),
  self: (e) => e.target !== e.currentTarget,
  ctrl: (e) => !e.ctrlKey,
  shift: (e) => !e.shiftKey,
  alt: (e) => !e.altKey,
  meta: (e) => !e.metaKey,
  left: (e) => "button" in e && e.button !== 0,
  middle: (e) => "button" in e && e.button !== 1,
  right: (e) => "button" in e && e.button !== 2,
  exact: (e, t) => Pr.some((s) => e[`${s}Key`] && !t.includes(s))
}, ti = (e, t) => {
  if (!e) return e;
  const s = e._withMods || (e._withMods = {}), n = t.join(".");
  return s[n] || (s[n] = (i, ...l) => {
    for (let o = 0; o < t.length; o++) {
      const a = xr[t[o]];
      if (a && a(i, t)) return;
    }
    return e(i, ...l);
  });
}, jr = {
  esc: "escape",
  space: " ",
  up: "arrow-up",
  left: "arrow-left",
  right: "arrow-right",
  down: "arrow-down",
  delete: "backspace"
}, si = (e, t) => {
  const s = e._withKeys || (e._withKeys = {}), n = t.join(".");
  return s[n] || (s[n] = (i) => {
    if (!("key" in i))
      return;
    const l = ot(i.key);
    if (t.some(
      (o) => o === l || jr[o] === l
    ))
      return e(i);
  });
}, Mr = /* @__PURE__ */ pe({ patchProp: _r }, cr);
let ni;
function Lr() {
  return ni || (ni = Hl(Mr));
}
const Fr = (...e) => {
  const t = Lr().createApp(...e), { mount: s } = t;
  return t.mount = (n) => {
    const i = Dr(n);
    if (!i) return;
    const l = t._component;
    !N(l) && !l.render && !l.template && (l.template = i.innerHTML), i.nodeType === 1 && (i.textContent = "");
    const o = s(i, !1, Ur(i));
    return i instanceof Element && (i.removeAttribute("v-cloak"), i.setAttribute("data-v-app", "")), o;
  }, t;
};
function Ur(e) {
  if (e instanceof SVGElement)
    return "svg";
  if (typeof MathMLElement == "function" && e instanceof MathMLElement)
    return "mathml";
}
function Dr(e) {
  return re(e) ? document.querySelector(e) : e;
}
const Kr = /* @__PURE__ */ ht({
  name: "InstanceListContainer",
  props: {
    instances: {
      type: Array,
      default: () => []
    },
    selectedRef: {
      type: String,
      default: null
    }
  },
  emits: ["select"],
  setup() {
    function e(t) {
      return Object.keys(t.tables).length;
    }
    return { tableCount: e };
  }
}), gt = (e, t) => {
  const s = e.__vccOpts || e;
  for (const [n, i] of t)
    s[n] = i;
  return s;
}, Nr = { class: "supascan-sidebar" }, Hr = { class: "supascan-section-title" }, Vr = { style: { float: "right", "font-style": "italic" } }, Wr = {
  key: 0,
  class: "empty-state",
  style: { padding: "24px 12px" }
}, Br = ["onClick"], zr = { class: "instance-ref" }, qr = { class: "instance-meta" }, Gr = {
  key: 0,
  class: "leak-badge"
}, Jr = {
  key: 1,
  style: { color: "#4ade80" }
};
function Yr(e, t, s, n, i, l) {
  return y(), v("div", Nr, [
    r("div", Hr, [
      t[0] || (t[0] = r(
        "i",
        { class: "fas fa-database" },
        null,
        -1
        /* CACHED */
      )),
      t[1] || (t[1] = I(
        " Instances ",
        -1
        /* CACHED */
      )),
      r(
        "span",
        Vr,
        M(e.instances.length),
        1
        /* TEXT */
      )
    ]),
    e.instances.length === 0 ? (y(), v("div", Wr, [...t[2] || (t[2] = [
      r(
        "i",
        { class: "fas fa-search" },
        null,
        -1
        /* CACHED */
      ),
      r(
        "span",
        null,
        [
          I("Browse a Supabase-backed app"),
          r("br"),
          I("or add an instance manually")
        ],
        -1
        /* CACHED */
      )
    ])])) : U("v-if", !0),
    (y(!0), v(
      G,
      null,
      Oe(e.instances, (o) => (y(), v("div", {
        key: o.projectRef,
        class: ee(["instance-item", { selected: e.selectedRef === o.projectRef }]),
        onClick: (a) => e.$emit("select", o.projectRef)
      }, [
        r(
          "div",
          zr,
          M(o.projectRef),
          1
          /* TEXT */
        ),
        r("div", qr, [
          o.serviceRoleLeak ? (y(), v("span", Gr, [...t[3] || (t[3] = [
            r(
              "i",
              { class: "fas fa-exclamation-triangle" },
              null,
              -1
              /* CACHED */
            ),
            I(
              " KEY LEAK ",
              -1
              /* CACHED */
            )
          ])])) : U("v-if", !0),
          o.anonKey ? (y(), v("span", Jr, [...t[4] || (t[4] = [
            r(
              "i",
              { class: "fas fa-key" },
              null,
              -1
              /* CACHED */
            )
          ])])) : U("v-if", !0),
          r(
            "span",
            null,
            M(e.tableCount(o)) + "T " + M(o.rpcs.length) + "R " + M(o.buckets.length) + "B",
            1
            /* TEXT */
          )
        ])
      ], 10, Br))),
      128
      /* KEYED_FRAGMENT */
    ))
  ]);
}
const Xr = /* @__PURE__ */ gt(Kr, [["render", Yr]]), Zr = /* @__PURE__ */ ht({
  name: "TableGridContainer",
  props: {
    tables: {
      type: Array,
      default: () => []
    },
    instance: {
      type: Object,
      default: null
    },
    sdk: {
      type: Object,
      default: void 0
    }
  },
  setup(e) {
    const t = /* @__PURE__ */ Z(/* @__PURE__ */ new Set());
    function s(u) {
      const f = new Set(t.value);
      f.has(u) ? f.delete(u) : f.add(u), t.value = f;
    }
    async function n(u) {
      var f, d;
      try {
        await navigator.clipboard.writeText(u), (f = e.sdk) == null || f.window.showToast("Copied to clipboard", { variant: "success" });
      } catch {
        (d = e.sdk) == null || d.window.showToast("Copy failed", { variant: "error" });
      }
    }
    async function i() {
      const u = e.instance, f = e.sdk;
      !u || !f || (await f.backend.clearTables(u.projectRef), f.window.showToast("Tables cleared", { variant: "success" }));
    }
    function l(u) {
      const f = (u.sessions ?? []).find((d) => d.id === u.activeSessionId);
      return (f == null ? void 0 : f.token) ?? u.anonKey ?? "";
    }
    function o(u) {
      if (u.sampleRow !== void 0)
        try {
          const f = JSON.parse(u.sampleRow), d = f.id !== void 0 ? String(f.id) : void 0;
          return { body: JSON.stringify(f, null, 2), idValue: d };
        } catch {
        }
      if (u.columns && u.columns.length > 0) {
        const f = {};
        for (const d of u.columns) f[d] = "";
        return { body: JSON.stringify(f, null, 2) };
      }
      return { body: `{
  
}` };
    }
    async function a(u, f) {
      const d = e.instance, g = e.sdk;
      if (!d || !g) return;
      const h = `${d.projectRef}.supabase.co`, O = d.anonKey ?? "", V = l(d), j = u.name;
      let B = `/rest/v1/${j}`, W = "";
      if (f === "POST")
        W = o(u).body;
      else if (f === "PATCH") {
        const P = o(u), H = P.idValue !== void 0 ? `id=eq.${P.idValue}` : "id=eq.REPLACE_ME";
        B = `/rest/v1/${j}?${H}`, W = P.body;
      } else
        B = `/rest/v1/${j}?select=*&limit=10`;
      const D = [
        `${f} ${B} HTTP/1.1`,
        `Host: ${h}`,
        `apikey: ${O}`,
        `Authorization: Bearer ${V}`,
        "Accept: application/json"
      ];
      if (f !== "GET") {
        const P = new TextEncoder().encode(W).length;
        D.push("Content-Type: application/json"), D.push("Prefer: return=representation"), D.push(`Content-Length: ${P}`);
      }
      const _ = D.join(`\r
`) + `\r
\r
` + (f === "GET" ? "" : W), T = await g.replay.createSession({
        type: "Raw",
        raw: _,
        connectionInfo: { host: h, port: 443, isTLS: !0 }
      });
      g.replay.openTab(T.id), g.window.showToast(`Opened ${f} ${j} in Replay`, { variant: "success" });
    }
    return { expanded: t, toggle: s, copy: n, clearTables: i, sendToReplay: a };
  }
}), Qr = {
  key: 0,
  class: "tablegrid-toolbar"
}, ea = ["disabled"], ta = {
  key: 1,
  class: "empty-state"
}, sa = {
  key: 2,
  class: "table-grid"
}, na = ["title", "onClick"], ia = { style: { "font-weight": "600" } }, oa = {
  key: 0,
  style: { "margin-left": "4px", "font-size": "10px", color: "#3ecf8e" },
  title: "Observed in traffic"
}, la = {
  key: 1,
  class: "status-pill status-untested"
}, ra = {
  key: 0,
  style: { color: "#f87171", "font-weight": "700" }
}, aa = {
  key: 1,
  style: { color: "#64748b" }
}, ua = {
  key: 1,
  class: "status-pill status-untested"
}, ca = {
  key: 0,
  class: "chip-list"
}, fa = {
  key: 0,
  class: "chip"
}, da = {
  key: 1,
  style: { color: "#64748b" }
}, pa = { class: "replay-actions" }, ha = ["disabled", "onClick"], ga = ["disabled", "onClick"], ba = ["disabled", "onClick"], ya = {
  key: 0,
  class: "detail-row"
}, va = { colspan: "7" }, ma = { class: "detail-box" }, wa = { class: "detail-head" }, Ca = ["onClick"], Sa = {
  key: 0,
  class: "detail-pre"
}, ka = {
  key: 1,
  style: { "font-size": "11px", color: "#64748b", padding: "6px 0" }
}, Ta = {
  key: 2,
  class: "idor-block"
}, $a = { class: "detail-head" }, Ra = {
  key: 0,
  class: "status-pill status-rows"
}, _a = {
  key: 1,
  class: "status-pill status-denied"
}, Ia = { class: "idor-table" }, Aa = { class: "idor-user" }, Ea = { class: "idor-sample" };
function Oa(e, t, s, n, i, l) {
  return y(), v("div", null, [
    e.tables.length > 0 ? (y(), v("div", Qr, [
      r(
        "span",
        null,
        M(e.tables.length) + " table(s)",
        1
        /* TEXT */
      ),
      r("button", {
        class: "supascan-btn supascan-btn-danger",
        style: { "font-size": "11px", padding: "2px 8px" },
        disabled: !e.instance,
        title: "Remove all tables for this instance",
        onClick: t[0] || (t[0] = (...o) => e.clearTables && e.clearTables(...o))
      }, [...t[1] || (t[1] = [
        r(
          "i",
          { class: "fas fa-trash" },
          null,
          -1
          /* CACHED */
        ),
        I(
          " Clear tables ",
          -1
          /* CACHED */
        )
      ])], 8, ea)
    ])) : U("v-if", !0),
    e.tables.length === 0 ? (y(), v("div", ta, [...t[2] || (t[2] = [
      r(
        "i",
        { class: "fas fa-table" },
        null,
        -1
        /* CACHED */
      ),
      r(
        "span",
        null,
        "No tables observed yet",
        -1
        /* CACHED */
      ),
      r(
        "span",
        { style: { "font-size": "11px", color: "#64748b" } },
        "Tables are detected passively as you browse the target app",
        -1
        /* CACHED */
      )
    ])])) : (y(), v("table", sa, [
      t[7] || (t[7] = r(
        "thead",
        null,
        [
          r("tr", null, [
            r("th", { style: { width: "24px" } }),
            r("th", null, [
              r("i", { class: "fas fa-table" }),
              I(" Table")
            ]),
            r("th", null, "Read"),
            r("th", null, "Rows"),
            r("th", null, "Write"),
            r("th", null, "Columns"),
            r("th", null, "Replay")
          ])
        ],
        -1
        /* CACHED */
      )),
      r("tbody", null, [
        (y(!0), v(
          G,
          null,
          Oe(e.tables, (o) => (y(), v(
            G,
            {
              key: o.name
            },
            [
              r("tr", null, [
                r("td", null, [
                  r("button", {
                    class: "expand-btn",
                    title: e.expanded.has(o.name) ? "Collapse" : "Expand",
                    onClick: (a) => e.toggle(o.name)
                  }, [
                    r(
                      "i",
                      {
                        class: ee(e.expanded.has(o.name) ? "fas fa-chevron-down" : "fas fa-chevron-right")
                      },
                      null,
                      2
                      /* CLASS */
                    )
                  ], 8, na)
                ]),
                r("td", null, [
                  r(
                    "span",
                    ia,
                    M(o.name),
                    1
                    /* TEXT */
                  ),
                  o.observed ? (y(), v("span", oa, [...t[3] || (t[3] = [
                    r(
                      "i",
                      { class: "fas fa-circle" },
                      null,
                      -1
                      /* CACHED */
                    )
                  ])])) : U("v-if", !0)
                ]),
                r("td", null, [
                  o.anonRead ? (y(), v(
                    "span",
                    {
                      key: 0,
                      class: ee(["status-pill", `status-${o.anonRead}`])
                    },
                    M(o.anonRead),
                    3
                    /* TEXT, CLASS */
                  )) : (y(), v("span", la, "—"))
                ]),
                r("td", null, [
                  o.rowCount !== void 0 ? (y(), v(
                    "span",
                    ra,
                    M(o.rowCount.toLocaleString()),
                    1
                    /* TEXT */
                  )) : (y(), v("span", aa, "—"))
                ]),
                r("td", null, [
                  o.anonWrite ? (y(), v(
                    "span",
                    {
                      key: 0,
                      class: ee(["status-pill", `status-${o.anonWrite}`])
                    },
                    M(o.anonWrite),
                    3
                    /* TEXT, CLASS */
                  )) : (y(), v("span", ua, "—"))
                ]),
                r("td", null, [
                  o.columns && o.columns.length > 0 ? (y(), v("div", ca, [
                    (y(!0), v(
                      G,
                      null,
                      Oe(o.columns.slice(0, 4), (a) => (y(), v(
                        "span",
                        {
                          key: a,
                          class: "chip"
                        },
                        M(a),
                        1
                        /* TEXT */
                      ))),
                      128
                      /* KEYED_FRAGMENT */
                    )),
                    o.columns.length > 4 ? (y(), v(
                      "span",
                      fa,
                      "+" + M(o.columns.length - 4),
                      1
                      /* TEXT */
                    )) : U("v-if", !0)
                  ])) : (y(), v("span", da, "—"))
                ]),
                r("td", null, [
                  r("div", pa, [
                    r("button", {
                      class: "supascan-btn",
                      style: { "font-size": "10px", padding: "1px 6px" },
                      disabled: !e.instance,
                      title: "Open a GET request to this table in Replay",
                      onClick: (a) => e.sendToReplay(o, "GET")
                    }, " GET ", 8, ha),
                    r("button", {
                      class: "supascan-btn",
                      style: { "font-size": "10px", padding: "1px 6px" },
                      disabled: !e.instance,
                      title: "Open a POST (insert) request to this table in Replay",
                      onClick: (a) => e.sendToReplay(o, "POST")
                    }, " POST ", 8, ga),
                    r("button", {
                      class: "supascan-btn",
                      style: { "font-size": "10px", padding: "1px 6px" },
                      disabled: !e.instance,
                      title: "Open a PATCH (update) request to this table in Replay",
                      onClick: (a) => e.sendToReplay(o, "PATCH")
                    }, " PATCH ", 8, ba)
                  ])
                ])
              ]),
              e.expanded.has(o.name) ? (y(), v("tr", ya, [
                r("td", va, [
                  r("div", ma, [
                    r("div", wa, [
                      t[5] || (t[5] = r(
                        "span",
                        null,
                        [
                          r("i", { class: "fas fa-file-code" }),
                          I(" Sample row (from read, limit=1)")
                        ],
                        -1
                        /* CACHED */
                      )),
                      o.sampleRow ? (y(), v("button", {
                        key: 0,
                        class: "supascan-btn",
                        style: { "font-size": "10px", padding: "1px 6px" },
                        onClick: (a) => e.copy(o.sampleRow)
                      }, [...t[4] || (t[4] = [
                        r(
                          "i",
                          { class: "fas fa-copy" },
                          null,
                          -1
                          /* CACHED */
                        ),
                        I(
                          " Copy ",
                          -1
                          /* CACHED */
                        )
                      ])], 8, Ca)) : U("v-if", !0)
                    ]),
                    o.sampleRow ? (y(), v(
                      "pre",
                      Sa,
                      M(o.sampleRow),
                      1
                      /* TEXT */
                    )) : (y(), v("div", ka, " No content captured. Run a read check — if the table is readable, the first row appears here. ")),
                    o.idor ? (y(), v("div", Ta, [
                      r("div", $a, [
                        t[6] || (t[6] = r(
                          "span",
                          null,
                          [
                            r("i", { class: "fas fa-users-rectangle" }),
                            I(" Cross-user read diff (IDOR/RLS)")
                          ],
                          -1
                          /* CACHED */
                        )),
                        o.idor.shared ? (y(), v("span", Ra, "shared — broken RLS")) : (y(), v("span", _a, "scoped per user"))
                      ]),
                      r("table", Ia, [
                        (y(!0), v(
                          G,
                          null,
                          Oe(o.idor.perUser, (a) => (y(), v("tr", {
                            key: a.label
                          }, [
                            r(
                              "td",
                              Aa,
                              M(a.label),
                              1
                              /* TEXT */
                            ),
                            r(
                              "td",
                              null,
                              M(a.rowCount.toLocaleString()) + " rows",
                              1
                              /* TEXT */
                            ),
                            r(
                              "td",
                              Ea,
                              M(a.sampleId !== void 0 ? `first id: ${a.sampleId}` : "—"),
                              1
                              /* TEXT */
                            )
                          ]))),
                          128
                          /* KEYED_FRAGMENT */
                        ))
                      ])
                    ])) : U("v-if", !0)
                  ])
                ])
              ])) : U("v-if", !0)
            ],
            64
            /* STABLE_FRAGMENT */
          ))),
          128
          /* KEYED_FRAGMENT */
        ))
      ])
    ]))
  ]);
}
const Pa = /* @__PURE__ */ gt(Zr, [["render", Oa]]), xa = /* @__PURE__ */ ht({
  name: "StorageGridContainer",
  props: {
    instance: {
      type: Object,
      default: null
    },
    sdk: {
      type: Object,
      default: void 0
    }
  },
  setup(e) {
    const t = /* @__PURE__ */ Z(!1), s = /* @__PURE__ */ Z(""), n = /* @__PURE__ */ Z(/* @__PURE__ */ new Set()), i = $e(
      () => {
        var _;
        return !!e.instance && (!!e.instance.anonKey || (((_ = e.instance.sessions) == null ? void 0 : _.length) ?? 0) > 0);
      }
    ), l = $e(() => {
      const _ = e.instance;
      if (!_) return [];
      const T = _.bucketStates ?? {};
      return [.../* @__PURE__ */ new Set([..._.buckets, ...Object.keys(T)])].map((H) => ({ name: H, state: T[H] }));
    });
    function o(_) {
      const T = new Set(n.value);
      T.has(_) ? T.delete(_) : T.add(_), n.value = T;
    }
    function a(_) {
      return _ === void 0 ? "—" : _ < 1024 ? `${_} B` : _ < 1024 * 1024 ? `${(_ / 1024).toFixed(1)} KB` : `${(_ / (1024 * 1024)).toFixed(1)} MB`;
    }
    async function u() {
      const _ = e.instance, T = e.sdk;
      if (!(!_ || !T)) {
        t.value = !0;
        try {
          await T.backend.runStorageEnum(_.projectRef, s.value);
        } finally {
          t.value = !1;
        }
      }
    }
    function f(_) {
      const T = (_.sessions ?? []).find((P) => P.id === _.activeSessionId);
      return (T == null ? void 0 : T.token) ?? _.anonKey ?? "";
    }
    function d(_, T, P, H, X, ue) {
      const le = [
        `${_} ${T} HTTP/1.1`,
        `Host: ${P}`,
        `apikey: ${H}`,
        `Authorization: Bearer ${X}`
      ];
      if (ue !== void 0) {
        const ke = new TextEncoder().encode(ue).length;
        le.push("Content-Type: application/json"), le.push(`Content-Length: ${ke}`);
      }
      return le.join(`\r
`) + `\r
\r
` + (ue ?? "");
    }
    async function g(_, T, P) {
      const H = e.sdk;
      if (!H) return;
      const X = await H.replay.createSession({
        type: "Raw",
        raw: _,
        connectionInfo: { host: T, port: 443, isTLS: !0 }
      });
      H.replay.openTab(X.id), H.window.showToast(`Opened ${P} in Replay`, { variant: "success" });
    }
    async function h(_) {
      const T = e.instance;
      if (!T || !e.sdk) return;
      const P = `${T.projectRef}.supabase.co`, H = JSON.stringify({ prefix: "", limit: 100 }, null, 2), X = d("POST", `/storage/v1/object/list/${_}`, P, T.anonKey ?? "", f(T), H);
      await g(X, P, `list ${_}`);
    }
    async function O(_, T) {
      const P = e.instance;
      if (!P || !e.sdk) return;
      const H = `${P.projectRef}.supabase.co`, X = d("GET", `/storage/v1/object/${_}/${T}`, H, P.anonKey ?? "", f(P));
      await g(X, H, `${_}/${T}`);
    }
    function V(_) {
      return _.split("/").map(encodeURIComponent).join("/");
    }
    function j(_) {
      var H;
      const T = _.sessions ?? [], P = T.find((X) => X.id === _.activeSessionId);
      return _.anonKey ?? (P == null ? void 0 : P.token) ?? ((H = T[0]) == null ? void 0 : H.token) ?? "";
    }
    function B(_, T) {
      const P = e.instance;
      return P ? `${P.projectUrl}/storage/v1/object/public/${_}/${V(T)}` : "";
    }
    async function W(_, T) {
      const P = e.sdk;
      if (P)
        try {
          await navigator.clipboard.writeText(B(_, T)), P.window.showToast("Public URL copied", { variant: "success" });
        } catch {
          P.window.showToast("Copy failed", { variant: "error" });
        }
    }
    async function D(_, T) {
      const P = e.instance, H = e.sdk;
      if (!P || !H) return;
      const X = `${P.projectUrl}/storage/v1/object/${_}/${V(T)}`, ue = f(P);
      try {
        const le = await fetch(X, {
          headers: { apikey: j(P), Authorization: `Bearer ${ue}` }
        });
        if (!le.ok) {
          H.window.showToast(`Download failed (${le.status})`, { variant: "error" });
          return;
        }
        const ke = await le.blob(), Le = URL.createObjectURL(ke), Ie = document.createElement("a");
        Ie.href = Le, Ie.download = T.split("/").pop() ?? "download", document.body.appendChild(Ie), Ie.click(), Ie.remove(), URL.revokeObjectURL(Le), H.window.showToast("Download started", { variant: "success" });
      } catch (le) {
        H.window.showToast(`Download error: ${String(le)}`, { variant: "error" });
      }
    }
    return {
      busy: t,
      wordlist: s,
      expanded: n,
      rows: l,
      toggle: o,
      formatSize: a,
      enumerate: u,
      replayList: h,
      replayGet: O,
      copyUrl: W,
      download: D,
      hasCreds: i
    };
  }
}), ja = { class: "rpc-bf" }, Ma = { class: "rpc-bf-head" }, La = ["disabled"], Fa = {
  key: 0,
  class: "empty-state"
}, Ua = {
  key: 1,
  class: "table-grid"
}, Da = ["onClick"], Ka = { style: { "font-weight": "600" } }, Na = {
  key: 0,
  style: { color: "#f87171", "font-weight": "700" }
}, Ha = {
  key: 1,
  style: { color: "#64748b" }
}, Va = {
  key: 2,
  style: { color: "#64748b" }
}, Wa = ["disabled", "onClick"], Ba = {
  key: 0,
  class: "detail-row"
}, za = { colspan: "4" }, qa = { class: "detail-box" }, Ga = { class: "detail-head" }, Ja = { class: "idor-table" }, Ya = { class: "idor-user" }, Xa = { style: { "white-space": "nowrap" } }, Za = { style: { "white-space": "nowrap", color: "#64748b" } }, Qa = { style: { width: "130px" } }, eu = { style: { display: "flex", gap: "4px" } }, tu = ["onClick"], su = ["onClick"], nu = ["onClick"];
function iu(e, t, s, n, i, l) {
  return y(), v("div", null, [
    U(" Enumeration panel "),
    r("div", ja, [
      r("div", Ma, [
        t[2] || (t[2] = r(
          "span",
          null,
          [
            r("i", { class: "fas fa-magnifying-glass" }),
            I(" Enumerate storage objects")
          ],
          -1
          /* CACHED */
        )),
        r("button", {
          class: "supascan-btn supascan-btn-primary",
          style: { "font-size": "11px", padding: "3px 10px" },
          disabled: !e.hasCreds || e.busy,
          onClick: t[0] || (t[0] = (...o) => e.enumerate && e.enumerate(...o))
        }, [
          r(
            "i",
            {
              class: ee(e.busy ? "fas fa-spinner fa-spin" : "fas fa-bolt")
            },
            null,
            2
            /* CLASS */
          ),
          I(
            " " + M(e.busy ? "Listing…" : "List objects"),
            1
            /* TEXT */
          )
        ], 8, La)
      ]),
      fe(r(
        "textarea",
        {
          "onUpdate:modelValue": t[1] || (t[1] = (o) => e.wordlist = o),
          class: "settings-input",
          rows: "2",
          placeholder: "Optional: extra bucket names, one per line (avatars, public, uploads, ...)",
          style: { "font-family": "ui-monospace,monospace", resize: "vertical", width: "100%" }
        },
        null,
        512
        /* NEED_PATCH */
      ), [
        [ve, e.wordlist]
      ]),
      t[3] || (t[3] = r(
        "span",
        { style: { "font-size": "11px", color: "#64748b" } },
        "Recursively lists objects in observed buckets, your names, and a built-in list (if discovery is on). Buckets that return files are public/exposed.",
        -1
        /* CACHED */
      ))
    ]),
    e.rows.length === 0 ? (y(), v("div", Fa, [...t[4] || (t[4] = [
      r(
        "i",
        { class: "fas fa-folder-open" },
        null,
        -1
        /* CACHED */
      ),
      r(
        "span",
        null,
        "No storage buckets yet",
        -1
        /* CACHED */
      ),
      r(
        "span",
        { style: { "font-size": "11px", color: "#64748b" } },
        `Browse the app's storage to discover buckets passively, or run "List objects" above.`,
        -1
        /* CACHED */
      )
    ])])) : (y(), v("table", Ua, [
      t[10] || (t[10] = r(
        "thead",
        null,
        [
          r("tr", null, [
            r("th", { style: { width: "24px" } }),
            r("th", null, [
              r("i", { class: "fas fa-folder" }),
              I(" Bucket")
            ]),
            r("th", null, "Objects"),
            r("th", null, "Replay")
          ])
        ],
        -1
        /* CACHED */
      )),
      r("tbody", null, [
        (y(!0), v(
          G,
          null,
          Oe(e.rows, (o) => (y(), v(
            G,
            {
              key: o.name
            },
            [
              r("tr", null, [
                r("td", null, [
                  o.state && o.state.files.length > 0 ? (y(), v("button", {
                    key: 0,
                    class: "expand-btn",
                    onClick: (a) => e.toggle(o.name)
                  }, [
                    r(
                      "i",
                      {
                        class: ee(e.expanded.has(o.name) ? "fas fa-chevron-down" : "fas fa-chevron-right")
                      },
                      null,
                      2
                      /* CLASS */
                    )
                  ], 8, Da)) : U("v-if", !0)
                ]),
                r("td", null, [
                  r(
                    "span",
                    Ka,
                    M(o.name),
                    1
                    /* TEXT */
                  )
                ]),
                r("td", null, [
                  o.state && o.state.fileCount > 0 ? (y(), v(
                    "span",
                    Na,
                    M(o.state.fileCount.toLocaleString()) + " file(s)",
                    1
                    /* TEXT */
                  )) : o.state ? (y(), v("span", Ha, "empty / private")) : (y(), v("span", Va, "untested"))
                ]),
                r("td", null, [
                  r("button", {
                    class: "supascan-btn",
                    style: { "font-size": "10px", padding: "1px 6px" },
                    disabled: !e.instance,
                    title: "Open a list-objects request for this bucket in Replay",
                    onClick: (a) => e.replayList(o.name)
                  }, [...t[5] || (t[5] = [
                    r(
                      "i",
                      { class: "fas fa-paper-plane" },
                      null,
                      -1
                      /* CACHED */
                    ),
                    I(
                      " List ",
                      -1
                      /* CACHED */
                    )
                  ])], 8, Wa)
                ])
              ]),
              e.expanded.has(o.name) && o.state ? (y(), v("tr", Ba, [
                r("td", za, [
                  r("div", qa, [
                    r("div", Ga, [
                      r("span", null, [
                        t[6] || (t[6] = r(
                          "i",
                          { class: "fas fa-file" },
                          null,
                          -1
                          /* CACHED */
                        )),
                        I(
                          ' Objects in "' + M(o.name) + '" (showing ' + M(o.state.files.length) + ")",
                          1
                          /* TEXT */
                        )
                      ])
                    ]),
                    r("table", Ja, [
                      (y(!0), v(
                        G,
                        null,
                        Oe(o.state.files, (a) => (y(), v("tr", {
                          key: a.path
                        }, [
                          r(
                            "td",
                            Ya,
                            M(a.path),
                            1
                            /* TEXT */
                          ),
                          r(
                            "td",
                            Xa,
                            M(e.formatSize(a.size)),
                            1
                            /* TEXT */
                          ),
                          r(
                            "td",
                            Za,
                            M(a.mimetype ?? ""),
                            1
                            /* TEXT */
                          ),
                          r("td", Qa, [
                            r("div", eu, [
                              r("button", {
                                class: "supascan-btn",
                                style: { "font-size": "10px", padding: "1px 6px" },
                                title: "Copy the public URL of this object",
                                onClick: (u) => e.copyUrl(o.name, a.path)
                              }, [...t[7] || (t[7] = [
                                r(
                                  "i",
                                  { class: "fas fa-link" },
                                  null,
                                  -1
                                  /* CACHED */
                                )
                              ])], 8, tu),
                              r("button", {
                                class: "supascan-btn",
                                style: { "font-size": "10px", padding: "1px 6px" },
                                title: "Download this object",
                                onClick: (u) => e.download(o.name, a.path)
                              }, [...t[8] || (t[8] = [
                                r(
                                  "i",
                                  { class: "fas fa-download" },
                                  null,
                                  -1
                                  /* CACHED */
                                )
                              ])], 8, su),
                              r("button", {
                                class: "supascan-btn",
                                style: { "font-size": "10px", padding: "1px 6px" },
                                title: "Open a GET for this object in Replay",
                                onClick: (u) => e.replayGet(o.name, a.path)
                              }, [...t[9] || (t[9] = [
                                r(
                                  "i",
                                  { class: "fas fa-paper-plane" },
                                  null,
                                  -1
                                  /* CACHED */
                                )
                              ])], 8, nu)
                            ])
                          ])
                        ]))),
                        128
                        /* KEYED_FRAGMENT */
                      ))
                    ])
                  ])
                ])
              ])) : U("v-if", !0)
            ],
            64
            /* STABLE_FRAGMENT */
          ))),
          128
          /* KEYED_FRAGMENT */
        ))
      ])
    ]))
  ]);
}
const ou = /* @__PURE__ */ gt(xa, [["render", iu]]), lu = /* @__PURE__ */ ht({
  name: "RpcGridContainer",
  props: {
    instance: {
      type: Object,
      default: null
    },
    sdk: {
      type: Object,
      default: void 0
    }
  },
  setup(e) {
    const t = /* @__PURE__ */ Z(!1), s = /* @__PURE__ */ Z(""), n = $e(
      () => {
        var f;
        return !!e.instance && (!!e.instance.anonKey || (((f = e.instance.sessions) == null ? void 0 : f.length) ?? 0) > 0);
      }
    );
    async function i() {
      const f = e.instance, d = e.sdk;
      if (!(!f || !d)) {
        t.value = !0;
        try {
          await d.backend.runRpcBruteforce(f.projectRef, s.value);
        } finally {
          t.value = !1;
        }
      }
    }
    const l = $e(() => {
      const f = e.instance;
      if (!f) return [];
      const d = f.rpcStates ?? {};
      return [.../* @__PURE__ */ new Set([...f.rpcs, ...Object.keys(d)])].map((h) => d[h] ?? { name: h, exposed: !1 });
    });
    function o(f) {
      return f >= 200 && f < 300 ? "#4ade80" : f >= 400 ? "#f87171" : "#facc15";
    }
    function a(f) {
      const d = (f.sessions ?? []).find((g) => g.id === f.activeSessionId);
      return (d == null ? void 0 : d.token) ?? f.anonKey ?? "";
    }
    async function u(f) {
      const d = e.instance, g = e.sdk;
      if (!d || !g) return;
      const h = `${d.projectRef}.supabase.co`, O = d.anonKey ?? "", V = a(d), j = "{}", B = new TextEncoder().encode(j).length, W = [
        `POST /rest/v1/rpc/${f} HTTP/1.1`,
        `Host: ${h}`,
        `apikey: ${O}`,
        `Authorization: Bearer ${V}`,
        "Content-Type: application/json",
        `Content-Length: ${B}`
      ].join(`\r
`) + `\r
\r
` + j, D = await g.replay.createSession({
        type: "Raw",
        raw: W,
        connectionInfo: { host: h, port: 443, isTLS: !0 }
      });
      g.replay.openTab(D.id), g.window.showToast(`Opened rpc/${f} in Replay`, { variant: "success" });
    }
    return { rows: l, statusColor: o, replayCall: u, busy: t, wordlist: s, bruteforce: i, hasCreds: n };
  }
}), ru = { class: "rpc-bf" }, au = { class: "rpc-bf-head" }, uu = ["disabled"], cu = {
  key: 0,
  class: "empty-state"
}, fu = {
  key: 1,
  class: "table-grid"
}, du = { style: { "font-weight": "600" } }, pu = {
  key: 1,
  style: { color: "#64748b" }
}, hu = {
  key: 0,
  class: "status-pill status-rows"
}, gu = {
  key: 1,
  class: "status-pill status-denied"
}, bu = {
  key: 2,
  class: "status-pill status-untested"
}, yu = ["disabled", "onClick"];
function vu(e, t, s, n, i, l) {
  return y(), v("div", null, [
    U(" Brute-force panel "),
    r("div", ru, [
      r("div", au, [
        t[2] || (t[2] = r(
          "span",
          null,
          [
            r("i", { class: "fas fa-hammer" }),
            I(" Brute-force RPC functions")
          ],
          -1
          /* CACHED */
        )),
        r("button", {
          class: "supascan-btn supascan-btn-primary",
          style: { "font-size": "11px", padding: "3px 10px" },
          disabled: !e.hasCreds || e.busy,
          onClick: t[0] || (t[0] = (...o) => e.bruteforce && e.bruteforce(...o))
        }, [
          r(
            "i",
            {
              class: ee(e.busy ? "fas fa-spinner fa-spin" : "fas fa-bolt")
            },
            null,
            2
            /* CLASS */
          ),
          I(
            " " + M(e.busy ? "Running…" : "Bruteforce"),
            1
            /* TEXT */
          )
        ], 8, uu)
      ]),
      fe(r(
        "textarea",
        {
          "onUpdate:modelValue": t[1] || (t[1] = (o) => e.wordlist = o),
          class: "settings-input",
          rows: "3",
          placeholder: "Optional: extra function names, one per line (get_user, is_admin, http_get, ...)",
          style: { "font-family": "ui-monospace,monospace", resize: "vertical", width: "100%" }
        },
        null,
        512
        /* NEED_PATCH */
      ), [
        [ve, e.wordlist]
      ]),
      t[3] || (t[3] = r(
        "span",
        { style: { "font-size": "11px", color: "#64748b" } },
        "Tests your names plus a built-in list of ~55 common/dangerous functions, as the active session. PostgREST hints confirm which functions exist.",
        -1
        /* CACHED */
      ))
    ]),
    e.rows.length === 0 ? (y(), v("div", cu, [...t[4] || (t[4] = [
      r(
        "i",
        { class: "fas fa-code" },
        null,
        -1
        /* CACHED */
      ),
      r(
        "span",
        null,
        "No RPC functions yet",
        -1
        /* CACHED */
      ),
      r(
        "span",
        { style: { "font-size": "11px", color: "#64748b" } },
        "Run an RPC check, brute-force above, or browse the target app.",
        -1
        /* CACHED */
      )
    ])])) : (y(), v("table", fu, [
      t[6] || (t[6] = r(
        "thead",
        null,
        [
          r("tr", null, [
            r("th", null, [
              r("i", { class: "fas fa-code" }),
              I(" Function")
            ]),
            r("th", null, "Status"),
            r("th", null, "Unauth reachable"),
            r("th", null, "Replay")
          ])
        ],
        -1
        /* CACHED */
      )),
      r("tbody", null, [
        (y(!0), v(
          G,
          null,
          Oe(e.rows, (o) => (y(), v("tr", {
            key: o.name
          }, [
            r("td", null, [
              r(
                "span",
                du,
                M(o.name),
                1
                /* TEXT */
              )
            ]),
            r("td", null, [
              o.status !== void 0 ? (y(), v(
                "span",
                {
                  key: 0,
                  style: Yt([{ color: e.statusColor(o.status) }, { "font-weight": "600" }])
                },
                M(o.status),
                5
                /* TEXT, STYLE */
              )) : (y(), v("span", pu, "—"))
            ]),
            r("td", null, [
              o.exposed ? (y(), v("span", hu, "yes")) : o.status !== void 0 ? (y(), v("span", gu, "no")) : (y(), v("span", bu, "untested"))
            ]),
            r("td", null, [
              r("button", {
                class: "supascan-btn",
                style: { "font-size": "10px", padding: "1px 6px" },
                disabled: !e.instance,
                title: "Open a call to this RPC function in Replay",
                onClick: (a) => e.replayCall(o.name)
              }, [...t[5] || (t[5] = [
                r(
                  "i",
                  { class: "fas fa-paper-plane" },
                  null,
                  -1
                  /* CACHED */
                ),
                I(
                  " Call ",
                  -1
                  /* CACHED */
                )
              ])], 8, yu)
            ])
          ]))),
          128
          /* KEYED_FRAGMENT */
        ))
      ])
    ]))
  ]);
}
const mu = /* @__PURE__ */ gt(lu, [["render", vu]]), wu = /* @__PURE__ */ ht({
  name: "RolesGridContainer",
  props: {
    instance: {
      type: Object,
      default: null
    },
    sdk: {
      type: Object,
      default: void 0
    }
  },
  setup(e) {
    const t = $e(() => {
      var a;
      const l = ((a = e.instance) == null ? void 0 : a.schemaStates) ?? {}, o = { critical: 0, high: 1, medium: 2 };
      return Object.values(l).sort((u, f) => u.exposed !== f.exposed ? u.exposed ? -1 : 1 : o[u.sensitivity] - o[f.sensitivity]);
    });
    function s(l) {
      return l === "critical" ? "status-rows" : l === "high" ? "status-accepted" : "status-untested";
    }
    function n(l) {
      const o = (l.sessions ?? []).find((a) => a.id === l.activeSessionId);
      return (o == null ? void 0 : o.token) ?? l.anonKey ?? "";
    }
    async function i(l) {
      const o = e.instance, a = e.sdk;
      if (!o || !a) return;
      const u = `${o.projectRef}.supabase.co`, f = o.anonKey ?? "", d = n(o), g = [
        "GET /rest/v1/ HTTP/1.1",
        `Host: ${u}`,
        `apikey: ${f}`,
        `Authorization: Bearer ${d}`,
        `Accept-Profile: ${l}`,
        "Accept: application/json"
      ].join(`\r
`) + `\r
\r
`, h = await a.replay.createSession({
        type: "Raw",
        raw: g,
        connectionInfo: { host: u, port: 443, isTLS: !0 }
      });
      a.replay.openTab(h.id), a.window.showToast(`Opened schema ${l} in Replay`, { variant: "success" });
    }
    return { rows: t, sensitivityClass: s, replaySchema: i };
  }
}), Cu = {
  key: 0,
  class: "empty-state"
}, Su = { key: 1 }, ku = { style: { "font-size": "11px", color: "#64748b", "margin-bottom": "8px" } }, Tu = { style: { color: "#3ecf8e" } }, $u = { class: "table-grid" }, Ru = { style: { "font-weight": "600" } }, _u = {
  key: 0,
  class: "status-pill status-rows"
}, Iu = {
  key: 1,
  class: "status-pill status-denied"
}, Au = { style: { color: "#64748b" } }, Eu = ["disabled", "onClick"];
function Ou(e, t, s, n, i, l) {
  return y(), v("div", null, [
    e.rows.length === 0 ? (y(), v("div", Cu, [...t[0] || (t[0] = [
      r(
        "i",
        { class: "fas fa-user-shield" },
        null,
        -1
        /* CACHED */
      ),
      r(
        "span",
        null,
        "No role/schema results yet",
        -1
        /* CACHED */
      ),
      r(
        "span",
        { style: { "font-size": "11px", color: "#64748b" } },
        "Run the Roles check to brute-force privileged PostgREST schemas as the active session.",
        -1
        /* CACHED */
      )
    ])])) : (y(), v("div", Su, [
      r("div", ku, [
        t[1] || (t[1] = I(
          " Tested as role: ",
          -1
          /* CACHED */
        )),
        r(
          "strong",
          Tu,
          M(e.rows[0].testedAs),
          1
          /* TEXT */
        ),
        t[2] || (t[2] = I(
          " — switch the active session in the Sessions tab and re-run to compare roles. ",
          -1
          /* CACHED */
        ))
      ]),
      r("table", $u, [
        t[4] || (t[4] = r(
          "thead",
          null,
          [
            r("tr", null, [
              r("th", null, [
                r("i", { class: "fas fa-layer-group" }),
                I(" Schema")
              ]),
              r("th", null, "Sensitivity"),
              r("th", null, "Reachable"),
              r("th", null, "Status"),
              r("th", null, "Replay")
            ])
          ],
          -1
          /* CACHED */
        )),
        r("tbody", null, [
          (y(!0), v(
            G,
            null,
            Oe(e.rows, (o) => (y(), v("tr", {
              key: o.name
            }, [
              r("td", null, [
                r(
                  "span",
                  Ru,
                  M(o.name),
                  1
                  /* TEXT */
                )
              ]),
              r("td", null, [
                r(
                  "span",
                  {
                    class: ee(["status-pill", e.sensitivityClass(o.sensitivity)])
                  },
                  M(o.sensitivity),
                  3
                  /* TEXT, CLASS */
                )
              ]),
              r("td", null, [
                o.exposed ? (y(), v("span", _u, "yes — privesc")) : (y(), v("span", Iu, "no"))
              ]),
              r("td", null, [
                r(
                  "span",
                  Au,
                  M(o.status ?? "—"),
                  1
                  /* TEXT */
                )
              ]),
              r("td", null, [
                r("button", {
                  class: "supascan-btn",
                  style: { "font-size": "10px", padding: "1px 6px" },
                  disabled: !e.instance,
                  title: "Open a request to this schema in Replay (Accept-Profile)",
                  onClick: (a) => e.replaySchema(o.name)
                }, [...t[3] || (t[3] = [
                  r(
                    "i",
                    { class: "fas fa-paper-plane" },
                    null,
                    -1
                    /* CACHED */
                  ),
                  I(
                    " Profile ",
                    -1
                    /* CACHED */
                  )
                ])], 8, Eu)
              ])
            ]))),
            128
            /* KEYED_FRAGMENT */
          ))
        ])
      ])
    ]))
  ]);
}
const Pu = /* @__PURE__ */ gt(wu, [["render", Ou]]), xu = /* @__PURE__ */ ht({
  name: "ActivityLogContainer",
  props: {
    entries: {
      type: Array,
      default: () => []
    }
  },
  emits: ["clear"],
  setup() {
    function e(n) {
      try {
        return new Date(n).toLocaleTimeString("en-US", { hour12: !1 });
      } catch {
        return n.slice(11, 19);
      }
    }
    function t(n) {
      return n.length <= 80 ? n : n.slice(0, 40) + "…" + n.slice(-30);
    }
    function s(n) {
      return n >= 200 && n < 300 ? "#4ade80" : n >= 300 && n < 400 ? "#facc15" : n >= 400 ? "#f87171" : "#94a3b8";
    }
    return { formatTime: e, truncateUrl: t, statusColor: s };
  }
}), ju = { class: "activity-log-wrapper" }, Mu = {
  class: "supascan-section-title",
  style: { display: "flex", "justify-content": "space-between", "align-items": "center" }
}, Lu = {
  key: 0,
  class: "empty-state"
}, Fu = {
  key: 1,
  class: "activity-log"
}, Uu = { class: "activity-ts" }, Du = { class: "activity-method" }, Ku = { class: "activity-url" }, Nu = {
  key: 1,
  class: "activity-note"
};
function Hu(e, t, s, n, i, l) {
  return y(), v("div", ju, [
    r("div", Mu, [
      t[2] || (t[2] = r(
        "span",
        null,
        [
          r("i", { class: "fas fa-list-ul" }),
          I(" Activity Log")
        ],
        -1
        /* CACHED */
      )),
      r("button", {
        class: "supascan-btn supascan-btn-danger",
        style: { "font-size": "11px" },
        onClick: t[0] || (t[0] = (o) => e.$emit("clear"))
      }, [...t[1] || (t[1] = [
        r(
          "i",
          { class: "fas fa-trash" },
          null,
          -1
          /* CACHED */
        ),
        I(
          " Clear ",
          -1
          /* CACHED */
        )
      ])])
    ]),
    e.entries.length === 0 ? (y(), v("div", Lu, [...t[3] || (t[3] = [
      r(
        "i",
        { class: "fas fa-inbox" },
        null,
        -1
        /* CACHED */
      ),
      r(
        "span",
        null,
        "No activity yet",
        -1
        /* CACHED */
      )
    ])])) : (y(), v("div", Fu, [
      (y(!0), v(
        G,
        null,
        Oe(e.entries, (o) => (y(), v("div", {
          key: o.id,
          class: "activity-entry"
        }, [
          r(
            "span",
            Uu,
            M(e.formatTime(o.timestamp)),
            1
            /* TEXT */
          ),
          r(
            "span",
            Du,
            M(o.method),
            1
            /* TEXT */
          ),
          r(
            "span",
            Ku,
            M(e.truncateUrl(o.url)),
            1
            /* TEXT */
          ),
          o.statusCode ? (y(), v(
            "span",
            {
              key: 0,
              class: "activity-status",
              style: Yt({ color: e.statusColor(o.statusCode) })
            },
            M(o.statusCode),
            5
            /* TEXT, STYLE */
          )) : U("v-if", !0),
          o.note ? (y(), v(
            "span",
            Nu,
            "— " + M(o.note),
            1
            /* TEXT */
          )) : U("v-if", !0)
        ]))),
        128
        /* KEYED_FRAGMENT */
      ))
    ]))
  ]);
}
const Vu = /* @__PURE__ */ gt(xu, [["render", Hu]]), Wu = /* @__PURE__ */ ht({
  name: "SupaScanContainer",
  components: {
    InstanceListContainer: Xr,
    TableGridContainer: Pa,
    StorageGridContainer: ou,
    RpcGridContainer: mu,
    RolesGridContainer: Pu,
    ActivityLogContainer: Vu
  },
  props: {
    sdk: {
      type: Object,
      required: !0
    }
  },
  setup(e) {
    const t = e.sdk, s = /* @__PURE__ */ Z([]), n = /* @__PURE__ */ Z([]), i = /* @__PURE__ */ Z(null), l = /* @__PURE__ */ Z("tables"), o = /* @__PURE__ */ Z(!1), a = /* @__PURE__ */ Z([]), u = /* @__PURE__ */ Z(!1), f = /* @__PURE__ */ Z(""), d = /* @__PURE__ */ Z(""), g = /* @__PURE__ */ Z(""), h = /* @__PURE__ */ Z(""), O = /* @__PURE__ */ Z("Password123!"), V = /* @__PURE__ */ Z(""), j = /* @__PURE__ */ Z(!1), B = /* @__PURE__ */ Z(null), W = /* @__PURE__ */ Z(""), D = /* @__PURE__ */ Z(""), _ = /* @__PURE__ */ Z(""), T = /* @__PURE__ */ Z(""), P = /* @__PURE__ */ Z(!1), H = /* @__PURE__ */ Z(""), X = /* @__PURE__ */ Z({
      maxRequestsPerSecond: 5,
      maxConcurrency: 3,
      redactEvidence: !1,
      testEmail: "supascan.probe@example.com",
      tableWordlist: "",
      useCustomWordlist: !1,
      discoveryEnabled: !0
    }), ue = /* @__PURE__ */ Z(null), le = $e(() => i.value ? s.value.find((m) => m.projectRef === i.value) ?? null : null), ke = $e(() => le.value ? Object.values(le.value.tables) : []), Le = $e(() => {
      var m;
      return ((m = le.value) == null ? void 0 : m.sessions) ?? [];
    }), Ie = $e(() => {
      const m = le.value;
      return !m || !m.activeSessionId ? null : (m.sessions ?? []).find((K) => K.id === m.activeSessionId) ?? null;
    }), bt = $e(() => s.value.some((m) => m.serviceRoleLeak)), yt = (m) => {
      var K;
      return !!m && (!!m.anonKey || (((K = m.sessions) == null ? void 0 : K.length) ?? 0) > 0);
    }, es = $e(() => yt(le.value)), ce = $e(
      () => yt(le.value) && !o.value
    );
    function ie(m) {
      i.value = m, l.value = "tables";
    }
    async function Q(m) {
      try {
        await navigator.clipboard.writeText(m), t.window.showToast("Anon key copied to clipboard", { variant: "success" });
      } catch {
        t.window.showToast("Copy failed — select and copy manually", { variant: "error" });
      }
    }
    async function Ge(m) {
      try {
        await navigator.clipboard.writeText(m), t.window.showToast("Copied to clipboard", { variant: "success" });
      } catch {
        t.window.showToast("Copy failed — select and copy manually", { variant: "error" });
      }
    }
    function vt(m) {
      a.value.push(m), a.value.length > 20 && (a.value = a.value.slice(-20));
    }
    function Je() {
      g.value = "";
      const m = window.__supascan_prefill_host;
      m !== void 0 && (f.value = m.includes("supabase.co") ? `https://${m}` : "", delete window.__supascan_prefill_host), u.value = !0;
    }
    async function Ae() {
      g.value = "";
      const m = await t.backend.addManualInstance(f.value, d.value);
      if (!m.ok) {
        g.value = m.error ?? "Unknown error";
        return;
      }
      u.value = !1, f.value = "", d.value = "", t.window.showToast("Instance added", { variant: "success" });
    }
    async function ts() {
      if (i.value) {
        j.value = !0, B.value = null;
        try {
          const m = await t.backend.customSignup(
            i.value,
            h.value,
            O.value,
            V.value
          );
          if (!m.ok) {
            t.window.showToast(m.error ?? "Signup failed", { variant: "error" }), B.value = { statusCode: m.statusCode, body: m.error };
            return;
          }
          B.value = {
            statusCode: m.statusCode,
            body: m.body,
            hasToken: m.hasToken,
            sessionSet: m.sessionSet
          }, m.sessionSet && t.window.showToast("Session captured — checks now run as this user", {
            variant: "success"
          });
        } finally {
          j.value = !1;
        }
      }
    }
    async function As() {
      i.value && await t.backend.setActiveSession(i.value, "");
    }
    async function Es(m) {
      i.value && await t.backend.setActiveSession(i.value, m);
    }
    async function lt(m) {
      i.value && await t.backend.removeSession(i.value, m);
    }
    async function mt() {
      if (i.value) {
        H.value = "", P.value = !0;
        try {
          const m = await t.backend.signInUser(
            i.value,
            W.value,
            D.value
          );
          if (!m.ok) {
            H.value = m.error ?? "Sign-in failed.";
            return;
          }
          if (!m.added) {
            H.value = `Sign-in did not return a token (status ${m.statusCode ?? "?"}). Check credentials.`;
            return;
          }
          W.value = "", D.value = "", t.window.showToast("User signed in and set as active session", { variant: "success" });
        } finally {
          P.value = !1;
        }
      }
    }
    async function Et() {
      if (i.value) {
        H.value = "", P.value = !0;
        try {
          const m = await t.backend.addSessionToken(
            i.value,
            _.value,
            T.value
          );
          if (!m.ok) {
            H.value = m.error ?? "Could not add token.";
            return;
          }
          _.value = "", T.value = "", t.window.showToast("Token added and set as active session", { variant: "success" });
        } finally {
          P.value = !1;
        }
      }
    }
    async function ss() {
      if (i.value) {
        o.value = !0, a.value = [];
        try {
          await t.backend.runReadChecks(i.value);
        } finally {
          o.value = !1;
        }
      }
    }
    async function rt() {
      if (i.value) {
        o.value = !0, a.value = [];
        try {
          await t.backend.runWriteProbes(i.value);
        } finally {
          o.value = !1;
        }
      }
    }
    async function vn() {
      if (i.value) {
        o.value = !0, a.value = [];
        try {
          await t.backend.runAuthCheck(i.value);
        } finally {
          o.value = !1;
        }
      }
    }
    async function c() {
      if (i.value) {
        o.value = !0, a.value = [];
        try {
          await t.backend.runRpcCheck(i.value);
        } finally {
          o.value = !1;
        }
      }
    }
    async function p() {
      if (i.value) {
        o.value = !0, a.value = [];
        try {
          await t.backend.runIdorCheck(i.value);
        } finally {
          o.value = !1;
        }
      }
    }
    async function b() {
      if (i.value) {
        o.value = !0, a.value = [];
        try {
          await t.backend.runRoleCheck(i.value);
        } finally {
          o.value = !1;
        }
      }
    }
    async function k() {
      await t.backend.saveSettings(X.value);
    }
    async function S() {
      await t.backend.stopAllChecks(), o.value = !1;
    }
    async function w() {
      await t.backend.clearActivityLog(), n.value = [];
    }
    async function A() {
      await t.backend.saveSettings(X.value), t.window.showToast("Settings saved", { variant: "success" });
    }
    function R() {
      var m;
      (m = ue.value) == null || m.click();
    }
    function $(m) {
      var oe;
      const K = m.target, z = (oe = K.files) == null ? void 0 : oe[0];
      if (!z) return;
      const q = new FileReader();
      q.onload = () => {
        X.value.tableWordlist = String(q.result ?? "");
        const ae = X.value.tableWordlist.split(/[\n,]/).map((Ce) => Ce.trim()).filter((Ce) => Ce.length > 0).length;
        t.window.showToast(`Loaded ${ae} table names from ${z.name}`, { variant: "success" });
      }, q.onerror = () => {
        t.window.showToast("Could not read file", { variant: "error" });
      }, q.readAsText(z), K.value = "";
    }
    async function C() {
      const [m, K, z] = await Promise.all([
        t.backend.getInstances(),
        t.backend.getSettings(),
        t.backend.getActivityLog()
      ]);
      s.value = m, X.value = K, n.value = z;
    }
    let L, E, x;
    return Ui(async () => {
      await C(), L = t.backend.onEvent("supascan:instances-updated", (m) => {
        s.value = m.instances;
      }), E = t.backend.onEvent("supascan:activity-updated", (m) => {
        n.value = m.entries;
      }), x = t.backend.onEvent("supascan:check-progress", (m) => {
        vt(m.message), (m.message.includes("complete") || m.message.includes("Stopped")) && (o.value = !1);
      });
    }), gn(() => {
      L == null || L(), E == null || E(), x == null || x();
    }), {
      instances: s,
      activityEntries: n,
      selectedRef: i,
      selectedInstance: le,
      selectedTables: ke,
      instanceSessions: Le,
      activeUser: Ie,
      hasServiceRoleLeak: bt,
      activeTab: l,
      isRunning: o,
      progressMessages: a,
      draftSettings: X,
      canProbe: ce,
      selectedHasCreds: es,
      showAddModal: u,
      manualUrl: f,
      manualAnonKey: d,
      manualError: g,
      signupEmail: h,
      signupPassword: O,
      signupData: V,
      signupRunning: j,
      signupResult: B,
      signInEmail: W,
      signInPassword: D,
      tokenLabel: _,
      tokenValue: T,
      sessionBusy: P,
      sessionError: H,
      onSelectInstance: ie,
      copyKey: Q,
      copyText: Ge,
      openAddModal: Je,
      submitManual: Ae,
      runCustomSignup: ts,
      useAnon: As,
      useSession: Es,
      removeUser: lt,
      addSignIn: mt,
      addToken: Et,
      runRead: ss,
      runWrite: rt,
      runAuth: vn,
      runRpc: c,
      runIdor: p,
      runRole: b,
      persistDiscovery: k,
      stopAll: S,
      onClearLog: w,
      saveSettings: A,
      wordlistFileInput: ue,
      triggerWordlistFile: R,
      onWordlistFile: $
    };
  }
}), Bu = { class: "supascan-root" }, zu = {
  key: 0,
  class: "supascan-banner"
}, qu = { class: "modal-box" }, Gu = { class: "modal-field" }, Ju = { class: "modal-field" }, Yu = {
  key: 0,
  style: { color: "#ef4444", "font-size": "12px", "margin-top": "4px" }
}, Xu = { class: "modal-actions" }, Zu = ["disabled"], Qu = { class: "supascan-header" }, ec = { class: "supascan-action-bar" }, tc = ["disabled"], sc = {
  class: "discovery-toggle",
  title: "When on, checks brute-force common/wordlist tables. When off, only tables seen in traffic are checked."
}, nc = ["disabled"], ic = ["disabled"], oc = ["disabled"], lc = ["disabled", "title"], rc = ["disabled"], ac = ["disabled"], uc = {
  key: 2,
  class: "session-strip"
}, cc = {
  key: 3,
  class: "progress-bar"
}, fc = {
  key: 0,
  class: "fas fa-spinner fa-spin"
}, dc = {
  key: 1,
  class: "fas fa-circle-check",
  style: { color: "#3ecf8e" }
}, pc = { class: "supascan-main" }, hc = { style: { flex: "1", display: "flex", "flex-direction": "column", overflow: "hidden" } }, gc = { class: "tab-bar" }, bc = {
  key: 0,
  class: "supascan-content"
}, yc = {
  key: 0,
  class: "empty-state"
}, vc = { class: "supascan-content" }, mc = {
  key: 0,
  class: "empty-state"
}, wc = { class: "supascan-content" }, Cc = {
  key: 0,
  class: "empty-state"
}, Sc = { class: "supascan-content" }, kc = {
  key: 0,
  class: "empty-state"
}, Tc = { class: "supascan-content" }, $c = {
  key: 0,
  class: "empty-state"
}, Rc = { key: 1 }, _c = { class: "info-grid" }, Ic = { class: "info-val" }, Ac = { class: "info-val" }, Ec = {
  class: "info-val",
  style: { "word-break": "break-all" }
}, Oc = { key: 0 }, Pc = { style: { display: "flex", "align-items": "flex-start", gap: "8px" } }, xc = { class: "apikey-box" }, jc = { style: { color: "#8892a4" } }, Mc = {
  key: 1,
  style: { color: "#64748b" }
}, Lc = { class: "info-val" }, Fc = {
  key: 0,
  style: { color: "#ef4444", "font-weight": "700" }
}, Uc = {
  key: 1,
  style: { color: "#3ecf8e" }
}, Dc = { class: "info-val" }, Kc = { class: "info-val" }, Nc = {
  key: 0,
  class: "chip-list"
}, Hc = {
  key: 1,
  style: { color: "#64748b" }
}, Vc = { class: "info-val" }, Wc = {
  key: 0,
  class: "chip-list"
}, Bc = {
  key: 1,
  style: { color: "#64748b" }
}, zc = { class: "supascan-content" }, qc = {
  key: 0,
  class: "empty-state"
}, Gc = {
  key: 1,
  class: "sessions-panel"
}, Jc = { class: "signup-title" }, Yc = { class: "session-list" }, Xc = ["checked"], Zc = ["checked", "onChange"], Qc = { class: "session-id" }, ef = { class: "session-source" }, tf = ["onClick"], sf = {
  key: 0,
  style: { "font-size": "11px", color: "#64748b", padding: "6px 2px" }
}, nf = { class: "session-add" }, of = { class: "settings-row" }, lf = { class: "settings-row" }, rf = ["disabled"], af = { class: "session-add" }, uf = { class: "settings-row" }, cf = { class: "settings-row" }, ff = ["disabled"], df = {
  key: 0,
  style: { color: "#ef4444", "font-size": "12px" }
}, pf = { class: "supascan-content" }, hf = {
  key: 0,
  class: "empty-state"
}, gf = {
  key: 1,
  class: "signup-panel"
}, bf = { class: "signup-title" }, yf = { style: { "font-size": "11px", color: "#64748b", "font-weight": "400" } }, vf = { class: "settings-row" }, mf = { class: "settings-row" }, wf = { class: "settings-row" }, Cf = ["disabled"], Sf = {
  key: 0,
  style: { "font-size": "11px", color: "#f59e0b" }
}, kf = {
  key: 1,
  class: "signup-result"
}, Tf = { class: "signup-result-head" }, $f = {
  key: 0,
  style: { color: "#f87171", "font-weight": "700" }
}, Rf = {
  key: 1,
  style: { color: "#3ecf8e" }
}, _f = {
  key: 2,
  style: { color: "#8892a4" }
}, If = {
  key: 0,
  class: "signup-session-note"
}, Af = { class: "signup-body" }, Ef = {
  class: "supascan-content",
  style: { padding: "0" }
}, Of = { class: "supascan-content" }, Pf = { class: "settings-panel" }, xf = { class: "settings-row" }, jf = { class: "settings-row" }, Mf = { class: "settings-row" }, Lf = { class: "settings-row" }, Ff = { class: "wordlist-switch" }, Uf = { class: "settings-row" }, Df = { style: { display: "flex", "align-items": "center", "justify-content": "space-between", gap: "8px" } }, Kf = ["disabled"], Nf = ["disabled"], Hf = { class: "settings-row" }, Vf = { class: "settings-toggle" };
function Wf(e, t, s, n, i, l) {
  const o = Ct("InstanceListContainer"), a = Ct("TableGridContainer"), u = Ct("StorageGridContainer"), f = Ct("RpcGridContainer"), d = Ct("RolesGridContainer"), g = Ct("ActivityLogContainer");
  return y(), v("div", Bu, [
    U(" CRITICAL: service_role leak banner "),
    e.hasServiceRoleLeak ? (y(), v("div", zu, [...t[51] || (t[51] = [
      r(
        "i",
        { class: "fas fa-skull-crossbones" },
        null,
        -1
        /* CACHED */
      ),
      I(
        " CRITICAL: Supabase service_role key leak detected in traffic — see Findings for details ",
        -1
        /* CACHED */
      )
    ])])) : U("v-if", !0),
    U(" Manual Add Instance modal "),
    e.showAddModal ? (y(), v("div", {
      key: 1,
      class: "modal-overlay",
      onClick: t[6] || (t[6] = ti((h) => e.showAddModal = !1, ["self"]))
    }, [
      r("div", qu, [
        t[58] || (t[58] = r(
          "div",
          { class: "modal-title" },
          [
            r("i", { class: "fas fa-plus" }),
            I(" Add Supabase Instance ")
          ],
          -1
          /* CACHED */
        )),
        r("div", Gu, [
          t[52] || (t[52] = r(
            "label",
            { class: "settings-label" },
            [
              I("Project URL "),
              r("span", { style: { color: "#ef4444" } }, "*")
            ],
            -1
            /* CACHED */
          )),
          fe(r(
            "input",
            {
              "onUpdate:modelValue": t[0] || (t[0] = (h) => e.manualUrl = h),
              type: "text",
              class: "settings-input",
              placeholder: "https://abcdefghijklmnopqrst.supabase.co",
              onKeydown: t[1] || (t[1] = si((...h) => e.submitManual && e.submitManual(...h), ["enter"]))
            },
            null,
            544
            /* NEED_HYDRATION, NEED_PATCH */
          ), [
            [ve, e.manualUrl]
          ]),
          t[53] || (t[53] = r(
            "span",
            { style: { "font-size": "11px", color: "#64748b" } },
            "Must contain a valid 20-char project ref",
            -1
            /* CACHED */
          ))
        ]),
        r("div", Ju, [
          t[54] || (t[54] = r(
            "label",
            { class: "settings-label" },
            "Anon Key (JWT)",
            -1
            /* CACHED */
          )),
          fe(r(
            "input",
            {
              "onUpdate:modelValue": t[2] || (t[2] = (h) => e.manualAnonKey = h),
              type: "text",
              class: "settings-input",
              placeholder: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
              onKeydown: t[3] || (t[3] = si((...h) => e.submitManual && e.submitManual(...h), ["enter"]))
            },
            null,
            544
            /* NEED_HYDRATION, NEED_PATCH */
          ), [
            [ve, e.manualAnonKey]
          ]),
          t[55] || (t[55] = r(
            "span",
            { style: { "font-size": "11px", color: "#64748b" } },
            "Optional — the public anon key from your app",
            -1
            /* CACHED */
          ))
        ]),
        e.manualError ? (y(), v("div", Yu, [
          t[56] || (t[56] = r(
            "i",
            { class: "fas fa-triangle-exclamation" },
            null,
            -1
            /* CACHED */
          )),
          I(
            " " + M(e.manualError),
            1
            /* TEXT */
          )
        ])) : U("v-if", !0),
        r("div", Xu, [
          r("button", {
            class: "supascan-btn",
            onClick: t[4] || (t[4] = (h) => e.showAddModal = !1)
          }, " Cancel "),
          r("button", {
            class: "supascan-btn supascan-btn-primary",
            disabled: !e.manualUrl,
            onClick: t[5] || (t[5] = (...h) => e.submitManual && e.submitManual(...h))
          }, [...t[57] || (t[57] = [
            r(
              "i",
              { class: "fas fa-plus" },
              null,
              -1
              /* CACHED */
            ),
            I(
              " Add Instance ",
              -1
              /* CACHED */
            )
          ])], 8, Zu)
        ])
      ])
    ])) : U("v-if", !0),
    U(" Header / action bar "),
    r("div", Qu, [
      t[69] || (t[69] = r(
        "div",
        { class: "supascan-header-title" },
        [
          r("i", {
            class: "fas fa-shield-halved",
            style: { color: "#3ecf8e" }
          }),
          I(" SupaScan "),
          r("span", { style: { "font-size": "10px", color: "#8892a4", "font-weight": "400" } }, "v0.1.0")
        ],
        -1
        /* CACHED */
      )),
      r("div", ec, [
        r("button", {
          class: "supascan-btn",
          title: "Manually add a Supabase instance",
          onClick: t[7] || (t[7] = (...h) => e.openAddModal && e.openAddModal(...h))
        }, [...t[59] || (t[59] = [
          r(
            "i",
            { class: "fas fa-plus" },
            null,
            -1
            /* CACHED */
          ),
          I(
            " Add Instance ",
            -1
            /* CACHED */
          )
        ])]),
        r("button", {
          class: "supascan-btn supascan-btn-primary",
          disabled: !e.canProbe,
          title: "Run read probes (limit=1 per table)",
          onClick: t[8] || (t[8] = (...h) => e.runRead && e.runRead(...h))
        }, [...t[60] || (t[60] = [
          r(
            "i",
            { class: "fas fa-eye" },
            null,
            -1
            /* CACHED */
          ),
          I(
            " Read Checks ",
            -1
            /* CACHED */
          )
        ])], 8, tc),
        r("label", sc, [
          fe(r(
            "input",
            {
              "onUpdate:modelValue": t[9] || (t[9] = (h) => e.draftSettings.discoveryEnabled = h),
              type: "checkbox",
              onChange: t[10] || (t[10] = (...h) => e.persistDiscovery && e.persistDiscovery(...h))
            },
            null,
            544
            /* NEED_HYDRATION, NEED_PATCH */
          ), [
            [Qn, e.draftSettings.discoveryEnabled]
          ]),
          t[61] || (t[61] = I(
            " discovery ",
            -1
            /* CACHED */
          ))
        ]),
        r("button", {
          class: "supascan-btn",
          disabled: !e.canProbe,
          title: "Write probes (tx=rollback — no data modified)",
          onClick: t[11] || (t[11] = (...h) => e.runWrite && e.runWrite(...h))
        }, [...t[62] || (t[62] = [
          r(
            "i",
            { class: "fas fa-pen" },
            null,
            -1
            /* CACHED */
          ),
          I(
            " Write Probes ",
            -1
            /* CACHED */
          )
        ])], 8, nc),
        r("button", {
          class: "supascan-btn",
          disabled: !e.canProbe,
          title: "Test open signup",
          onClick: t[12] || (t[12] = (...h) => e.runAuth && e.runAuth(...h))
        }, [...t[63] || (t[63] = [
          r(
            "i",
            { class: "fas fa-user-plus" },
            null,
            -1
            /* CACHED */
          ),
          I(
            " Auth Check ",
            -1
            /* CACHED */
          )
        ])], 8, ic),
        r("button", {
          class: "supascan-btn",
          disabled: !e.canProbe,
          title: "Enumerate and test RPC functions",
          onClick: t[13] || (t[13] = (...h) => e.runRpc && e.runRpc(...h))
        }, [...t[64] || (t[64] = [
          r(
            "i",
            { class: "fas fa-code" },
            null,
            -1
            /* CACHED */
          ),
          I(
            " RPC ",
            -1
            /* CACHED */
          )
        ])], 8, oc),
        r("button", {
          class: "supascan-btn",
          disabled: !e.canProbe || e.instanceSessions.length < 2,
          title: e.instanceSessions.length < 2 ? "Add 2+ users in the Sessions tab to diff their access" : "Diff what each user can read to catch broken RLS / IDOR",
          onClick: t[14] || (t[14] = (...h) => e.runIdor && e.runIdor(...h))
        }, [...t[65] || (t[65] = [
          r(
            "i",
            { class: "fas fa-users-rectangle" },
            null,
            -1
            /* CACHED */
          ),
          I(
            " IDOR/RLS ",
            -1
            /* CACHED */
          )
        ])], 8, lc),
        r("button", {
          class: "supascan-btn",
          disabled: !e.canProbe,
          title: "Brute-force privileged PostgREST schemas to find privilege escalation (runs as the active session)",
          onClick: t[15] || (t[15] = (...h) => e.runRole && e.runRole(...h))
        }, [...t[66] || (t[66] = [
          r(
            "i",
            { class: "fas fa-user-shield" },
            null,
            -1
            /* CACHED */
          ),
          I(
            " Roles ",
            -1
            /* CACHED */
          )
        ])], 8, rc),
        r("button", {
          class: "supascan-btn supascan-btn-danger",
          disabled: !e.isRunning,
          onClick: t[16] || (t[16] = (...h) => e.stopAll && e.stopAll(...h))
        }, [...t[67] || (t[67] = [
          r(
            "i",
            { class: "fas fa-stop" },
            null,
            -1
            /* CACHED */
          ),
          I(
            " Stop All ",
            -1
            /* CACHED */
          )
        ])], 8, ac),
        r(
          "button",
          {
            class: ee(["supascan-btn", { active: e.activeTab === "settings" }]),
            title: "Settings",
            onClick: t[17] || (t[17] = (h) => e.activeTab = e.activeTab === "settings" ? "tables" : "settings")
          },
          [...t[68] || (t[68] = [
            r(
              "i",
              { class: "fas fa-gear" },
              null,
              -1
              /* CACHED */
            )
          ])],
          2
          /* CLASS */
        )
      ])
    ]),
    U(" Active session strip "),
    e.activeUser ? (y(), v("div", uc, [
      r("span", null, [
        t[70] || (t[70] = r(
          "i",
          { class: "fas fa-user-check" },
          null,
          -1
          /* CACHED */
        )),
        t[71] || (t[71] = I(
          " Checks run as ",
          -1
          /* CACHED */
        )),
        r(
          "strong",
          null,
          M(e.activeUser.email),
          1
          /* TEXT */
        ),
        t[72] || (t[72] = r(
          "span",
          { style: { color: "#8892a4" } },
          " (authenticated session)",
          -1
          /* CACHED */
        ))
      ]),
      r("button", {
        class: "supascan-btn",
        style: { "font-size": "11px", padding: "2px 8px" },
        title: "Revert all checks to the anonymous key",
        onClick: t[18] || (t[18] = (...h) => e.useAnon && e.useAnon(...h))
      }, [...t[73] || (t[73] = [
        r(
          "i",
          { class: "fas fa-user-slash" },
          null,
          -1
          /* CACHED */
        ),
        I(
          " Use anon ",
          -1
          /* CACHED */
        )
      ])])
    ])) : U("v-if", !0),
    U(" Progress messages "),
    e.progressMessages.length > 0 ? (y(), v("div", cc, [
      e.isRunning ? (y(), v("i", fc)) : (y(), v("i", dc)),
      I(
        " " + M(e.progressMessages[e.progressMessages.length - 1]),
        1
        /* TEXT */
      )
    ])) : U("v-if", !0),
    U(" Main layout "),
    r("div", pc, [
      xe(o, {
        instances: e.instances,
        "selected-ref": e.selectedRef,
        onSelect: e.onSelectInstance
      }, null, 8, ["instances", "selected-ref", "onSelect"]),
      r("div", hc, [
        U(" Tab bar "),
        r("div", gc, [
          r(
            "button",
            {
              class: ee(["tab-btn", { active: e.activeTab === "tables" }]),
              onClick: t[19] || (t[19] = (h) => e.activeTab = "tables")
            },
            [...t[74] || (t[74] = [
              r(
                "i",
                { class: "fas fa-table" },
                null,
                -1
                /* CACHED */
              ),
              I(
                " Tables ",
                -1
                /* CACHED */
              )
            ])],
            2
            /* CLASS */
          ),
          r(
            "button",
            {
              class: ee(["tab-btn", { active: e.activeTab === "storage" }]),
              onClick: t[20] || (t[20] = (h) => e.activeTab = "storage")
            },
            [...t[75] || (t[75] = [
              r(
                "i",
                { class: "fas fa-folder-open" },
                null,
                -1
                /* CACHED */
              ),
              I(
                " Storage ",
                -1
                /* CACHED */
              )
            ])],
            2
            /* CLASS */
          ),
          r(
            "button",
            {
              class: ee(["tab-btn", { active: e.activeTab === "rpc" }]),
              onClick: t[21] || (t[21] = (h) => e.activeTab = "rpc")
            },
            [...t[76] || (t[76] = [
              r(
                "i",
                { class: "fas fa-code" },
                null,
                -1
                /* CACHED */
              ),
              I(
                " RPC ",
                -1
                /* CACHED */
              )
            ])],
            2
            /* CLASS */
          ),
          r(
            "button",
            {
              class: ee(["tab-btn", { active: e.activeTab === "roles" }]),
              onClick: t[22] || (t[22] = (h) => e.activeTab = "roles")
            },
            [...t[77] || (t[77] = [
              r(
                "i",
                { class: "fas fa-database" },
                null,
                -1
                /* CACHED */
              ),
              I(
                " Databases ",
                -1
                /* CACHED */
              )
            ])],
            2
            /* CLASS */
          ),
          r(
            "button",
            {
              class: ee(["tab-btn", { active: e.activeTab === "info" }]),
              onClick: t[23] || (t[23] = (h) => e.activeTab = "info")
            },
            [...t[78] || (t[78] = [
              r(
                "i",
                { class: "fas fa-circle-info" },
                null,
                -1
                /* CACHED */
              ),
              I(
                " Instance Info ",
                -1
                /* CACHED */
              )
            ])],
            2
            /* CLASS */
          ),
          r(
            "button",
            {
              class: ee(["tab-btn", { active: e.activeTab === "sessions" }]),
              onClick: t[24] || (t[24] = (h) => e.activeTab = "sessions")
            },
            [...t[79] || (t[79] = [
              r(
                "i",
                { class: "fas fa-users" },
                null,
                -1
                /* CACHED */
              ),
              I(
                " Sessions ",
                -1
                /* CACHED */
              )
            ])],
            2
            /* CLASS */
          ),
          r(
            "button",
            {
              class: ee(["tab-btn", { active: e.activeTab === "signup" }]),
              onClick: t[25] || (t[25] = (h) => e.activeTab = "signup")
            },
            [...t[80] || (t[80] = [
              r(
                "i",
                { class: "fas fa-user-plus" },
                null,
                -1
                /* CACHED */
              ),
              I(
                " Signup ",
                -1
                /* CACHED */
              )
            ])],
            2
            /* CLASS */
          ),
          r(
            "button",
            {
              class: ee(["tab-btn", { active: e.activeTab === "log" }]),
              onClick: t[26] || (t[26] = (h) => e.activeTab = "log")
            },
            [...t[81] || (t[81] = [
              r(
                "i",
                { class: "fas fa-list-ul" },
                null,
                -1
                /* CACHED */
              ),
              I(
                " Activity Log ",
                -1
                /* CACHED */
              )
            ])],
            2
            /* CLASS */
          ),
          r(
            "button",
            {
              class: ee(["tab-btn", { active: e.activeTab === "settings" }]),
              onClick: t[27] || (t[27] = (h) => e.activeTab = "settings")
            },
            [...t[82] || (t[82] = [
              r(
                "i",
                { class: "fas fa-gear" },
                null,
                -1
                /* CACHED */
              ),
              I(
                " Settings ",
                -1
                /* CACHED */
              )
            ])],
            2
            /* CLASS */
          )
        ]),
        U(" Tables tab "),
        e.activeTab === "tables" ? (y(), v("div", bc, [
          e.selectedInstance ? (y(), Mt(a, {
            key: 1,
            tables: e.selectedTables,
            instance: e.selectedInstance,
            sdk: e.sdk
          }, null, 8, ["tables", "instance", "sdk"])) : (y(), v("div", yc, [...t[83] || (t[83] = [
            r(
              "i",
              { class: "fas fa-database" },
              null,
              -1
              /* CACHED */
            ),
            r(
              "span",
              null,
              "Select an instance to view tables",
              -1
              /* CACHED */
            )
          ])]))
        ])) : e.activeTab === "storage" ? (y(), v(
          G,
          { key: 1 },
          [
            U(" Storage tab "),
            r("div", vc, [
              e.selectedInstance ? (y(), Mt(u, {
                key: 1,
                instance: e.selectedInstance,
                sdk: e.sdk
              }, null, 8, ["instance", "sdk"])) : (y(), v("div", mc, [...t[84] || (t[84] = [
                r(
                  "i",
                  { class: "fas fa-folder-open" },
                  null,
                  -1
                  /* CACHED */
                ),
                r(
                  "span",
                  null,
                  "Select an instance to view storage",
                  -1
                  /* CACHED */
                )
              ])]))
            ])
          ],
          2112
          /* STABLE_FRAGMENT, DEV_ROOT_FRAGMENT */
        )) : e.activeTab === "rpc" ? (y(), v(
          G,
          { key: 2 },
          [
            U(" RPC tab "),
            r("div", wc, [
              e.selectedInstance ? (y(), Mt(f, {
                key: 1,
                instance: e.selectedInstance,
                sdk: e.sdk
              }, null, 8, ["instance", "sdk"])) : (y(), v("div", Cc, [...t[85] || (t[85] = [
                r(
                  "i",
                  { class: "fas fa-code" },
                  null,
                  -1
                  /* CACHED */
                ),
                r(
                  "span",
                  null,
                  "Select an instance to view RPC functions",
                  -1
                  /* CACHED */
                )
              ])]))
            ])
          ],
          2112
          /* STABLE_FRAGMENT, DEV_ROOT_FRAGMENT */
        )) : e.activeTab === "roles" ? (y(), v(
          G,
          { key: 3 },
          [
            U(" Roles tab "),
            r("div", Sc, [
              e.selectedInstance ? (y(), Mt(d, {
                key: 1,
                instance: e.selectedInstance,
                sdk: e.sdk
              }, null, 8, ["instance", "sdk"])) : (y(), v("div", kc, [...t[86] || (t[86] = [
                r(
                  "i",
                  { class: "fas fa-user-shield" },
                  null,
                  -1
                  /* CACHED */
                ),
                r(
                  "span",
                  null,
                  "Select an instance to run the role check",
                  -1
                  /* CACHED */
                )
              ])]))
            ])
          ],
          2112
          /* STABLE_FRAGMENT, DEV_ROOT_FRAGMENT */
        )) : e.activeTab === "info" ? (y(), v(
          G,
          { key: 4 },
          [
            U(" Instance info tab "),
            r("div", Tc, [
              e.selectedInstance ? (y(), v("div", Rc, [
                r("div", _c, [
                  t[90] || (t[90] = r(
                    "span",
                    { class: "info-key" },
                    "Project URL",
                    -1
                    /* CACHED */
                  )),
                  r(
                    "span",
                    Ic,
                    M(e.selectedInstance.projectUrl),
                    1
                    /* TEXT */
                  ),
                  t[91] || (t[91] = r(
                    "span",
                    { class: "info-key" },
                    "Project Ref",
                    -1
                    /* CACHED */
                  )),
                  r(
                    "span",
                    Ac,
                    M(e.selectedInstance.projectRef),
                    1
                    /* TEXT */
                  ),
                  t[92] || (t[92] = r(
                    "span",
                    { class: "info-key" },
                    "Anon Key",
                    -1
                    /* CACHED */
                  )),
                  r("span", Ec, [
                    e.selectedInstance.anonKey ? (y(), v("span", Oc, [
                      r("div", Pc, [
                        r(
                          "code",
                          xc,
                          M(e.selectedInstance.anonKey),
                          1
                          /* TEXT */
                        ),
                        r("button", {
                          class: "supascan-btn",
                          style: { "flex-shrink": "0" },
                          title: "Copy anon key",
                          onClick: t[28] || (t[28] = (h) => e.copyKey(e.selectedInstance.anonKey))
                        }, [...t[88] || (t[88] = [
                          r(
                            "i",
                            { class: "fas fa-copy" },
                            null,
                            -1
                            /* CACHED */
                          )
                        ])])
                      ]),
                      r(
                        "span",
                        jc,
                        "role: " + M(e.selectedInstance.anonKeyRole ?? "?"),
                        1
                        /* TEXT */
                      )
                    ])) : (y(), v("span", Mc, "Not detected"))
                  ]),
                  t[93] || (t[93] = r(
                    "span",
                    { class: "info-key" },
                    "Service Role Leak",
                    -1
                    /* CACHED */
                  )),
                  r("span", Lc, [
                    e.selectedInstance.serviceRoleLeak ? (y(), v("span", Fc, [
                      t[89] || (t[89] = r(
                        "i",
                        { class: "fas fa-skull-crossbones" },
                        null,
                        -1
                        /* CACHED */
                      )),
                      I(
                        " DETECTED in " + M(e.selectedInstance.serviceRoleLeak.location),
                        1
                        /* TEXT */
                      )
                    ])) : (y(), v("span", Uc, "None detected"))
                  ]),
                  t[94] || (t[94] = r(
                    "span",
                    { class: "info-key" },
                    "Tables (observed)",
                    -1
                    /* CACHED */
                  )),
                  r(
                    "span",
                    Dc,
                    M(Object.keys(e.selectedInstance.tables).length),
                    1
                    /* TEXT */
                  ),
                  t[95] || (t[95] = r(
                    "span",
                    { class: "info-key" },
                    "RPCs",
                    -1
                    /* CACHED */
                  )),
                  r("span", Kc, [
                    e.selectedInstance.rpcs.length > 0 ? (y(), v("div", Nc, [
                      (y(!0), v(
                        G,
                        null,
                        Oe(e.selectedInstance.rpcs, (h) => (y(), v(
                          "span",
                          {
                            key: h,
                            class: "chip"
                          },
                          M(h),
                          1
                          /* TEXT */
                        ))),
                        128
                        /* KEYED_FRAGMENT */
                      ))
                    ])) : (y(), v("span", Hc, "None"))
                  ]),
                  t[96] || (t[96] = r(
                    "span",
                    { class: "info-key" },
                    "Buckets",
                    -1
                    /* CACHED */
                  )),
                  r("span", Vc, [
                    e.selectedInstance.buckets.length > 0 ? (y(), v("div", Wc, [
                      (y(!0), v(
                        G,
                        null,
                        Oe(e.selectedInstance.buckets, (h) => (y(), v(
                          "span",
                          {
                            key: h,
                            class: "chip"
                          },
                          M(h),
                          1
                          /* TEXT */
                        ))),
                        128
                        /* KEYED_FRAGMENT */
                      ))
                    ])) : (y(), v("span", Bc, "None"))
                  ])
                ])
              ])) : (y(), v("div", $c, [...t[87] || (t[87] = [
                r(
                  "i",
                  { class: "fas fa-database" },
                  null,
                  -1
                  /* CACHED */
                ),
                r(
                  "span",
                  null,
                  "Select an instance",
                  -1
                  /* CACHED */
                )
              ])]))
            ])
          ],
          2112
          /* STABLE_FRAGMENT, DEV_ROOT_FRAGMENT */
        )) : e.activeTab === "sessions" ? (y(), v(
          G,
          { key: 5 },
          [
            U(" Sessions tab "),
            r("div", zc, [
              e.selectedInstance ? (y(), v("div", Gc, [
                r("div", Jc, [
                  t[98] || (t[98] = r(
                    "i",
                    { class: "fas fa-users" },
                    null,
                    -1
                    /* CACHED */
                  )),
                  I(
                    " Sessions for " + M(e.selectedInstance.projectRef),
                    1
                    /* TEXT */
                  )
                ]),
                t[111] || (t[111] = r(
                  "span",
                  { style: { "font-size": "11px", color: "#64748b" } },
                  "Choose which identity all checks run as. Sessions belong to this instance only.",
                  -1
                  /* CACHED */
                )),
                U(" Identity selector "),
                r("div", Yc, [
                  r(
                    "label",
                    {
                      class: ee(["session-row", { "session-row--active": !e.selectedInstance.activeSessionId }])
                    },
                    [
                      r("input", {
                        type: "radio",
                        checked: !e.selectedInstance.activeSessionId,
                        onChange: t[29] || (t[29] = (...h) => e.useAnon && e.useAnon(...h))
                      }, null, 40, Xc),
                      t[99] || (t[99] = r(
                        "span",
                        { class: "session-id" },
                        [
                          r("i", { class: "fas fa-user-secret" }),
                          I(" Anonymous "),
                          r("span", { style: { color: "#64748b" } }, "(anon key)")
                        ],
                        -1
                        /* CACHED */
                      ))
                    ],
                    2
                    /* CLASS */
                  ),
                  (y(!0), v(
                    G,
                    null,
                    Oe(e.instanceSessions, (h) => (y(), v(
                      "label",
                      {
                        key: h.id,
                        class: ee(["session-row", { "session-row--active": e.selectedInstance.activeSessionId === h.id }])
                      },
                      [
                        r("input", {
                          type: "radio",
                          checked: e.selectedInstance.activeSessionId === h.id,
                          onChange: (O) => e.useSession(h.id)
                        }, null, 40, Zc),
                        r("span", Qc, [
                          t[100] || (t[100] = r(
                            "i",
                            { class: "fas fa-user" },
                            null,
                            -1
                            /* CACHED */
                          )),
                          I(
                            " " + M(h.email) + " ",
                            1
                            /* TEXT */
                          ),
                          r(
                            "span",
                            ef,
                            M(h.source),
                            1
                            /* TEXT */
                          )
                        ]),
                        r("button", {
                          class: "supascan-btn supascan-btn-danger",
                          style: { "font-size": "10px", padding: "1px 6px" },
                          title: "Remove this session",
                          onClick: ti((O) => e.removeUser(h.id), ["prevent"])
                        }, [...t[101] || (t[101] = [
                          r(
                            "i",
                            { class: "fas fa-trash" },
                            null,
                            -1
                            /* CACHED */
                          )
                        ])], 8, tf)
                      ],
                      2
                      /* CLASS */
                    ))),
                    128
                    /* KEYED_FRAGMENT */
                  )),
                  e.instanceSessions.length === 0 ? (y(), v("div", sf, " No users yet — sign in below or create one from the Signup tab. ")) : U("v-if", !0)
                ]),
                U(" Add existing user via sign-in "),
                r("div", nf, [
                  t[105] || (t[105] = r(
                    "div",
                    { class: "session-add-title" },
                    [
                      r("i", { class: "fas fa-right-to-bracket" }),
                      I(" Add existing user (sign in) ")
                    ],
                    -1
                    /* CACHED */
                  )),
                  r("div", of, [
                    t[102] || (t[102] = r(
                      "label",
                      { class: "settings-label" },
                      "Email",
                      -1
                      /* CACHED */
                    )),
                    fe(r(
                      "input",
                      {
                        "onUpdate:modelValue": t[30] || (t[30] = (h) => e.signInEmail = h),
                        type: "text",
                        class: "settings-input",
                        placeholder: "user@example.com"
                      },
                      null,
                      512
                      /* NEED_PATCH */
                    ), [
                      [ve, e.signInEmail]
                    ])
                  ]),
                  r("div", lf, [
                    t[103] || (t[103] = r(
                      "label",
                      { class: "settings-label" },
                      "Password",
                      -1
                      /* CACHED */
                    )),
                    fe(r(
                      "input",
                      {
                        "onUpdate:modelValue": t[31] || (t[31] = (h) => e.signInPassword = h),
                        type: "text",
                        class: "settings-input",
                        placeholder: "password"
                      },
                      null,
                      512
                      /* NEED_PATCH */
                    ), [
                      [ve, e.signInPassword]
                    ])
                  ]),
                  r("button", {
                    class: "supascan-btn supascan-btn-primary",
                    disabled: !e.selectedHasCreds || !e.signInEmail || e.sessionBusy,
                    onClick: t[32] || (t[32] = (...h) => e.addSignIn && e.addSignIn(...h))
                  }, [
                    r(
                      "i",
                      {
                        class: ee(e.sessionBusy ? "fas fa-spinner fa-spin" : "fas fa-right-to-bracket")
                      },
                      null,
                      2
                      /* CLASS */
                    ),
                    t[104] || (t[104] = I(
                      " Sign in & add ",
                      -1
                      /* CACHED */
                    ))
                  ], 8, rf)
                ]),
                U(" Add user via raw token "),
                r("div", af, [
                  t[109] || (t[109] = r(
                    "div",
                    { class: "session-add-title" },
                    [
                      r("i", { class: "fas fa-key" }),
                      I(" Add by access token ")
                    ],
                    -1
                    /* CACHED */
                  )),
                  r("div", uf, [
                    t[106] || (t[106] = r(
                      "label",
                      { class: "settings-label" },
                      "Label / email",
                      -1
                      /* CACHED */
                    )),
                    fe(r(
                      "input",
                      {
                        "onUpdate:modelValue": t[33] || (t[33] = (h) => e.tokenLabel = h),
                        type: "text",
                        class: "settings-input",
                        placeholder: "user@example.com"
                      },
                      null,
                      512
                      /* NEED_PATCH */
                    ), [
                      [ve, e.tokenLabel]
                    ])
                  ]),
                  r("div", cf, [
                    t[107] || (t[107] = r(
                      "label",
                      { class: "settings-label" },
                      "Access token (JWT)",
                      -1
                      /* CACHED */
                    )),
                    fe(r(
                      "input",
                      {
                        "onUpdate:modelValue": t[34] || (t[34] = (h) => e.tokenValue = h),
                        type: "text",
                        class: "settings-input",
                        placeholder: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                      },
                      null,
                      512
                      /* NEED_PATCH */
                    ), [
                      [ve, e.tokenValue]
                    ])
                  ]),
                  r("button", {
                    class: "supascan-btn",
                    disabled: !e.tokenLabel || !e.tokenValue || e.sessionBusy,
                    onClick: t[35] || (t[35] = (...h) => e.addToken && e.addToken(...h))
                  }, [...t[108] || (t[108] = [
                    r(
                      "i",
                      { class: "fas fa-plus" },
                      null,
                      -1
                      /* CACHED */
                    ),
                    I(
                      " Add token ",
                      -1
                      /* CACHED */
                    )
                  ])], 8, ff)
                ]),
                e.sessionError ? (y(), v("div", df, [
                  t[110] || (t[110] = r(
                    "i",
                    { class: "fas fa-triangle-exclamation" },
                    null,
                    -1
                    /* CACHED */
                  )),
                  I(
                    " " + M(e.sessionError),
                    1
                    /* TEXT */
                  )
                ])) : U("v-if", !0)
              ])) : (y(), v("div", qc, [...t[97] || (t[97] = [
                r(
                  "i",
                  { class: "fas fa-users" },
                  null,
                  -1
                  /* CACHED */
                ),
                r(
                  "span",
                  null,
                  "Select an instance to manage its sessions",
                  -1
                  /* CACHED */
                )
              ])]))
            ])
          ],
          2112
          /* STABLE_FRAGMENT, DEV_ROOT_FRAGMENT */
        )) : e.activeTab === "signup" ? (y(), v(
          G,
          { key: 6 },
          [
            U(" Custom signup tab "),
            r("div", pf, [
              e.selectedInstance ? (y(), v("div", gf, [
                r("div", bf, [
                  t[113] || (t[113] = r(
                    "i",
                    { class: "fas fa-user-plus" },
                    null,
                    -1
                    /* CACHED */
                  )),
                  t[114] || (t[114] = I(
                    " Custom Signup ",
                    -1
                    /* CACHED */
                  )),
                  r(
                    "span",
                    yf,
                    "POST " + M(e.selectedInstance.projectUrl) + "/auth/v1/signup",
                    1
                    /* TEXT */
                  )
                ]),
                r("div", vf, [
                  t[115] || (t[115] = r(
                    "label",
                    { class: "settings-label" },
                    "Email",
                    -1
                    /* CACHED */
                  )),
                  fe(r(
                    "input",
                    {
                      "onUpdate:modelValue": t[36] || (t[36] = (h) => e.signupEmail = h),
                      type: "text",
                      class: "settings-input",
                      placeholder: "user@example.com"
                    },
                    null,
                    512
                    /* NEED_PATCH */
                  ), [
                    [ve, e.signupEmail]
                  ])
                ]),
                r("div", mf, [
                  t[116] || (t[116] = r(
                    "label",
                    { class: "settings-label" },
                    "Password",
                    -1
                    /* CACHED */
                  )),
                  fe(r(
                    "input",
                    {
                      "onUpdate:modelValue": t[37] || (t[37] = (h) => e.signupPassword = h),
                      type: "text",
                      class: "settings-input",
                      placeholder: "Password123!"
                    },
                    null,
                    512
                    /* NEED_PATCH */
                  ), [
                    [ve, e.signupPassword]
                  ])
                ]),
                r("div", wf, [
                  t[117] || (t[117] = r(
                    "label",
                    { class: "settings-label" },
                    "Extra data (JSON, optional)",
                    -1
                    /* CACHED */
                  )),
                  fe(r(
                    "textarea",
                    {
                      "onUpdate:modelValue": t[38] || (t[38] = (h) => e.signupData = h),
                      class: "settings-input",
                      rows: "3",
                      placeholder: '{ "full_name": "Test User" }',
                      style: { "font-family": "ui-monospace,monospace", resize: "vertical" }
                    },
                    null,
                    512
                    /* NEED_PATCH */
                  ), [
                    [ve, e.signupData]
                  ]),
                  t[118] || (t[118] = r(
                    "span",
                    { style: { "font-size": "11px", color: "#64748b" } },
                    [
                      I("Sent as the "),
                      r("code", null, "data"),
                      I(" object (user metadata) in the signup body.")
                    ],
                    -1
                    /* CACHED */
                  ))
                ]),
                r("button", {
                  class: "supascan-btn supascan-btn-primary",
                  disabled: !e.selectedHasCreds || !e.signupEmail || e.signupRunning,
                  onClick: t[39] || (t[39] = (...h) => e.runCustomSignup && e.runCustomSignup(...h))
                }, [
                  r(
                    "i",
                    {
                      class: ee(e.signupRunning ? "fas fa-spinner fa-spin" : "fas fa-paper-plane")
                    },
                    null,
                    2
                    /* CLASS */
                  ),
                  t[119] || (t[119] = I(
                    " Send Signup ",
                    -1
                    /* CACHED */
                  ))
                ], 8, Cf),
                e.selectedHasCreds ? U("v-if", !0) : (y(), v("span", Sf, "No credentials for this instance — add an anon key or a session to enable signup.")),
                e.signupResult ? (y(), v("div", kf, [
                  r("div", Tf, [
                    r(
                      "span",
                      {
                        class: ee(e.signupResult.hasToken ? "status-pill status-rows" : "status-pill status-untested")
                      },
                      M(e.signupResult.statusCode ?? "ERR"),
                      3
                      /* TEXT, CLASS */
                    ),
                    e.signupResult.hasToken ? (y(), v("span", $f, [...t[120] || (t[120] = [
                      r(
                        "i",
                        { class: "fas fa-triangle-exclamation" },
                        null,
                        -1
                        /* CACHED */
                      ),
                      I(
                        " Instant session returned (open signup)",
                        -1
                        /* CACHED */
                      )
                    ])])) : e.signupResult.statusCode && e.signupResult.statusCode < 300 ? (y(), v("span", Rf, "Accepted (no instant token — may need email confirmation)")) : (y(), v("span", _f, "Rejected")),
                    e.signupResult.body ? (y(), v("button", {
                      key: 3,
                      class: "supascan-btn",
                      style: { "font-size": "10px", padding: "1px 6px", "margin-left": "auto" },
                      title: "Copy response body",
                      onClick: t[40] || (t[40] = (h) => e.copyText(e.signupResult.body))
                    }, [...t[121] || (t[121] = [
                      r(
                        "i",
                        { class: "fas fa-copy" },
                        null,
                        -1
                        /* CACHED */
                      ),
                      I(
                        " Copy response ",
                        -1
                        /* CACHED */
                      )
                    ])])) : U("v-if", !0)
                  ]),
                  e.signupResult.sessionSet ? (y(), v("div", If, [
                    t[122] || (t[122] = r(
                      "i",
                      { class: "fas fa-circle-check" },
                      null,
                      -1
                      /* CACHED */
                    )),
                    t[123] || (t[123] = I(
                      " Session captured — all checks (read, write, storage, RPC) now run as ",
                      -1
                      /* CACHED */
                    )),
                    r(
                      "strong",
                      null,
                      M(e.signupEmail),
                      1
                      /* TEXT */
                    ),
                    t[124] || (t[124] = I(
                      " instead of anon. ",
                      -1
                      /* CACHED */
                    ))
                  ])) : U("v-if", !0),
                  r(
                    "pre",
                    Af,
                    M(e.signupResult.body),
                    1
                    /* TEXT */
                  )
                ])) : U("v-if", !0)
              ])) : (y(), v("div", hf, [...t[112] || (t[112] = [
                r(
                  "i",
                  { class: "fas fa-user-plus" },
                  null,
                  -1
                  /* CACHED */
                ),
                r(
                  "span",
                  null,
                  "Select an instance to run a custom signup",
                  -1
                  /* CACHED */
                )
              ])]))
            ])
          ],
          2112
          /* STABLE_FRAGMENT, DEV_ROOT_FRAGMENT */
        )) : e.activeTab === "log" ? (y(), v(
          G,
          { key: 7 },
          [
            U(" Activity log tab "),
            r("div", Ef, [
              xe(g, {
                entries: e.activityEntries,
                onClear: e.onClearLog
              }, null, 8, ["entries", "onClear"])
            ])
          ],
          2112
          /* STABLE_FRAGMENT, DEV_ROOT_FRAGMENT */
        )) : e.activeTab === "settings" ? (y(), v(
          G,
          { key: 8 },
          [
            U(" Settings tab "),
            r("div", Of, [
              r("div", Pf, [
                t[135] || (t[135] = r(
                  "div",
                  { style: { "font-weight": "700", "margin-bottom": "16px", color: "#3ecf8e" } },
                  [
                    r("i", { class: "fas fa-gear" }),
                    I(" SupaScan Settings ")
                  ],
                  -1
                  /* CACHED */
                )),
                r("div", xf, [
                  t[125] || (t[125] = r(
                    "label",
                    { class: "settings-label" },
                    "Max Requests / Second",
                    -1
                    /* CACHED */
                  )),
                  fe(r(
                    "input",
                    {
                      "onUpdate:modelValue": t[41] || (t[41] = (h) => e.draftSettings.maxRequestsPerSecond = h),
                      type: "number",
                      min: "1",
                      max: "20",
                      class: "settings-input"
                    },
                    null,
                    512
                    /* NEED_PATCH */
                  ), [
                    [
                      ve,
                      e.draftSettings.maxRequestsPerSecond,
                      void 0,
                      { number: !0 }
                    ]
                  ])
                ]),
                r("div", jf, [
                  t[126] || (t[126] = r(
                    "label",
                    { class: "settings-label" },
                    "Max Concurrency",
                    -1
                    /* CACHED */
                  )),
                  fe(r(
                    "input",
                    {
                      "onUpdate:modelValue": t[42] || (t[42] = (h) => e.draftSettings.maxConcurrency = h),
                      type: "number",
                      min: "1",
                      max: "10",
                      class: "settings-input"
                    },
                    null,
                    512
                    /* NEED_PATCH */
                  ), [
                    [
                      ve,
                      e.draftSettings.maxConcurrency,
                      void 0,
                      { number: !0 }
                    ]
                  ])
                ]),
                r("div", Mf, [
                  t[127] || (t[127] = r(
                    "label",
                    { class: "settings-label" },
                    "Test Email (auth signup check)",
                    -1
                    /* CACHED */
                  )),
                  fe(r(
                    "input",
                    {
                      "onUpdate:modelValue": t[43] || (t[43] = (h) => e.draftSettings.testEmail = h),
                      type: "text",
                      class: "settings-input",
                      placeholder: "supascan.probe@example.com"
                    },
                    null,
                    512
                    /* NEED_PATCH */
                  ), [
                    [ve, e.draftSettings.testEmail]
                  ]),
                  t[128] || (t[128] = r(
                    "span",
                    { style: { "font-size": "11px", color: "#64748b" } },
                    [
                      I("Full email used for the open-signup test. Tip: include "),
                      r("code", null, "{rand}"),
                      I(" (e.g. "),
                      r("code", null, "you+{rand}@example.com"),
                      I(") for a unique address each run.")
                    ],
                    -1
                    /* CACHED */
                  ))
                ]),
                r("div", Lf, [
                  t[129] || (t[129] = r(
                    "label",
                    { class: "settings-label" },
                    "Discovery wordlist source",
                    -1
                    /* CACHED */
                  )),
                  r("div", Ff, [
                    r(
                      "button",
                      {
                        class: ee(["wordlist-opt", { active: !e.draftSettings.useCustomWordlist }]),
                        onClick: t[44] || (t[44] = (h) => e.draftSettings.useCustomWordlist = !1)
                      },
                      " Default (~65 tables) ",
                      2
                      /* CLASS */
                    ),
                    r(
                      "button",
                      {
                        class: ee(["wordlist-opt", { active: e.draftSettings.useCustomWordlist }]),
                        onClick: t[45] || (t[45] = (h) => e.draftSettings.useCustomWordlist = !0)
                      },
                      " Custom wordlist ",
                      2
                      /* CLASS */
                    )
                  ])
                ]),
                r("div", Uf, [
                  r("div", Df, [
                    t[131] || (t[131] = r(
                      "label",
                      { class: "settings-label" },
                      "Custom table wordlist",
                      -1
                      /* CACHED */
                    )),
                    r("button", {
                      class: "supascan-btn",
                      style: { "font-size": "11px", padding: "2px 8px" },
                      disabled: !e.draftSettings.useCustomWordlist,
                      onClick: t[46] || (t[46] = (...h) => e.triggerWordlistFile && e.triggerWordlistFile(...h))
                    }, [...t[130] || (t[130] = [
                      r(
                        "i",
                        { class: "fas fa-file-arrow-up" },
                        null,
                        -1
                        /* CACHED */
                      ),
                      I(
                        " Load from file ",
                        -1
                        /* CACHED */
                      )
                    ])], 8, Kf)
                  ]),
                  r(
                    "input",
                    {
                      ref: "wordlistFileInput",
                      type: "file",
                      accept: ".txt,.lst,.csv,text/plain",
                      style: { display: "none" },
                      onChange: t[47] || (t[47] = (...h) => e.onWordlistFile && e.onWordlistFile(...h))
                    },
                    null,
                    544
                    /* NEED_HYDRATION, NEED_PATCH */
                  ),
                  fe(r("textarea", {
                    "onUpdate:modelValue": t[48] || (t[48] = (h) => e.draftSettings.tableWordlist = h),
                    class: "settings-input",
                    rows: "6",
                    placeholder: `users
profiles
orders
...`,
                    style: { "font-family": "ui-monospace,monospace", resize: "vertical" },
                    disabled: !e.draftSettings.useCustomWordlist
                  }, null, 8, Nf), [
                    [ve, e.draftSettings.tableWordlist]
                  ]),
                  t[132] || (t[132] = r(
                    "span",
                    { style: { "font-size": "11px", color: "#64748b" } },
                    [
                      I("One table name per line (commas also allowed). Active only when "),
                      r("strong", null, "Custom wordlist"),
                      I(" is selected above and discovery is enabled.")
                    ],
                    -1
                    /* CACHED */
                  ))
                ]),
                r("div", Hf, [
                  r("label", Vf, [
                    fe(r(
                      "input",
                      {
                        "onUpdate:modelValue": t[49] || (t[49] = (h) => e.draftSettings.redactEvidence = h),
                        type: "checkbox"
                      },
                      null,
                      512
                      /* NEED_PATCH */
                    ), [
                      [Qn, e.draftSettings.redactEvidence]
                    ]),
                    t[133] || (t[133] = r(
                      "span",
                      {
                        class: "settings-label",
                        style: { margin: "0" }
                      },
                      "Redact Evidence (mask keys in logs)",
                      -1
                      /* CACHED */
                    ))
                  ])
                ]),
                r("button", {
                  class: "supascan-btn supascan-btn-primary",
                  onClick: t[50] || (t[50] = (...h) => e.saveSettings && e.saveSettings(...h))
                }, [...t[134] || (t[134] = [
                  r(
                    "i",
                    { class: "fas fa-floppy-disk" },
                    null,
                    -1
                    /* CACHED */
                  ),
                  I(
                    " Save Settings ",
                    -1
                    /* CACHED */
                  )
                ])])
              ])
            ])
          ],
          2112
          /* STABLE_FRAGMENT, DEV_ROOT_FRAGMENT */
        )) : U("v-if", !0)
      ])
    ])
  ]);
}
const Bf = /* @__PURE__ */ gt(Wu, [["render", Wf]]), zf = (e) => {
  const t = document.createElement("div");
  t.style.height = "100%", t.style.overflow = "hidden", Fr(Bf, { sdk: e }).mount(t), e.navigation.addPage("/supascan", { body: t }), e.sidebar.registerItem("SupaScan", "/supascan", { icon: "fas fa-shield-halved" }), e.commands.register("supascan:open", {
    name: "SupaScan: Open Panel",
    run: () => e.navigation.goTo("/supascan")
  }), e.commandPalette.register("supascan:open"), e.commands.register("supascan:seed-request", {
    name: "SupaScan: Analyze Request",
    run: async (n) => {
      if (n.type === "Request" && n.requests.length > 0) {
        const i = n.requests[0].getId();
        await e.backend.seedFromRequest(i), e.navigation.goTo("/supascan");
      }
    }
  }), e.menu.registerItem({ type: "Request", commandId: "supascan:seed-request", leadingIcon: "fas fa-shield-halved" }), e.commands.register("supascan:add-instance", {
    name: "SupaScan: Add as Supabase Instance",
    run: async (n) => {
      if (n.type === "Request" && n.requests.length > 0) {
        const i = n.requests[0].getHost();
        window.__supascan_prefill_host = i;
      }
      e.navigation.goTo("/supascan");
    }
  }), e.menu.registerItem({ type: "Request", commandId: "supascan:add-instance", leadingIcon: "fas fa-plus" }), e.commandPalette.register("supascan:add-instance");
};
export {
  zf as init
};
