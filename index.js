const Minifrdg = (rootSelector) => {
  const base = {name:'', targets:null};
  const useHash = /\.html/.test(document.baseURI);
  const templates = {};
  const controllers = {};
  const callbacks = {};
  let hooks = {};
  const rootComponents = [];
  const text = document.createElement('div');
  const $ = (selector, elem) => (elem || document).querySelector(selector);
  const $$ = (selector, elem) => Array.from((elem || document).querySelectorAll(selector));
  const safe = (text) => (typeof(text)!=='string') && text || (text || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
  const fill = (template, ctrl) => {const result = template.replace(/\n/g,'/*NL*/').replace(/\{\{(.+?)\}\}/gm, (all, str) => {const r = (new Function("try{with(this) {return " + (/&.+?;/.test(str) && (text.innerHTML = str) && text.innerText || str) + "}}catch(e){return ''}")).call(typeof(ctrl)==='object' && Object.assign(ctrl,{app:app})||ctrl); return ['undefined','null'].includes(typeof(r))?'':(/app\.fill/.test(all)?r:app.safe(r))}); /<[^>]*\s(href=|on)[^>]+>/.test(result) && hookActions(result); return result.replace(/\/\*NL\*\//g,'\n')};
  const on = (eventName, cb) => (callbacks[eventName] = callbacks[eventName] || []).push(cb);
  const fireCallbacks = async (eventName, data) => (await (callbacks[eventName] || []).reduce(((p,fn) => p.then((res) => fn(res,app))), Promise.resolve(data)));
  const inflate = (name, data) => fill(template = templates[name] || '', (hooks[name] = data || controllers[name] && controllers[name](app) || {}));
  const hookActions = (result) => setTimeout(() => {
    $$('a').forEach(anchor => anchor.href && !anchor.onclick && !anchor.target && (anchor.onclick = () => {app.goto(anchor.href.replace(document.location.origin,''));return false}));
    [rootSelector || 'app', ...rootComponents].forEach(component => ($(component) && $$('*', $(component)).forEach(elm => elm.getAttributeNames().forEach(name => /^on/.test(name) ? (elm.txt = elm.getAttribute(name)) && (elm.removeAttribute(name) || (elm[name] = (event, ctx) => new Function("with(this) {return " + elm.txt + "}").call(Object.assign(elm,{app:app,event:event})))) || (delete elm.txt) : ''))));
  });
  const refresh = (targets) => {const t = targets || base.targets; return [rootSelector || 'app', ...rootComponents].filter(component => !t || (t.includes(component) && !hooks[component])).forEach(component => ($(component) || {}).innerHTML = inflate(component===(rootSelector || 'app') && app.route || component, hooks[app.route]))};
  const setState = async (targets) => {
    [route, ...app.params] = (useHash && window.location.hash.replace('#', '').replace(/^\//, '') || window.location.pathname.replace(/^\//, '')).replace(base.name, '').split(/\//g);
    app.route = templates[route] && !/^_/.test(route) && route || 'dashboard';
    try {await fireCallbacks('routeChange')} catch(e) {return}
    (await fireCallbacks('cleanup') || (delete callbacks.cleanup)) && (hooks = {});
    refresh(targets);
  };
  window.addEventListener('popstate', setState);
  const goto = (route, targets) => {
    if(useHash) document.location.hash = route;
    else {
      route = document.location.origin + '/' + route.replace(/^\//, '');
      route !== document.location.pathname && window.history.pushState(route, null, route);
    }
    setState(targets);
  };
  const loadLocalTemplates = () => $$('script[type="text/template"]').reduce((res, template) => (res[template.id] = template.innerText) && res, app.templates);
  const app = {base,templates,controllers,hooks,callbacks,rootComponents,$,$$,safe,fill,on,fireCallbacks,goto,refresh,loadLocalTemplates,start: () => setState(),fns:{},vars:{},mfid: (base) => parseInt(new Date().getTime().toString().split('').reverse().join('').toString() + Math.floor(Math.random() * 999999).toString()).toString(base || 36)};
  return app;
}
(typeof(module)!=='undefined') && (module.exports = Minifrdg) || (window.Minifrdg = Minifrdg);