const Minifrdg = () => {
  let route = null;
  let params = null;
  const base = {name:''};
  const useHash = /\.html/.test(document.baseURI);
  const templates = {};
  const controllers = {};
  const callbacks = {};
  let hooks = {};
  const components = [];
  const $ = (selector, elem) => (elem || document).querySelector(selector);
  const $$ = (selector, elem) => Array.from((elem || document).querySelectorAll(selector));
  const fill = (template, ctrl) => template.replace(/\{\{(.+?)\}\}/g, (all, str) => (new Function("with(this) {return " + str + "}")).call(ctrl));
  const on = (eventName, cb) => (callbacks[eventName] = callbacks[eventName] || []).push(cb);
  const fireCallbacks = (eventName, data) => (callbacks[eventName] || []).forEach(fn => fn(data));
  const inflate = (name, data) => fill(template = templates[name] || '', (hooks[route] = data || controllers[name] && controllers[name]() || {}));
  const refresh = () => {
    ['app', ...components].forEach((component) => ($(component) || {}).innerHTML = inflate(component==='app' && route || component, hooks[route]));
    $$('a').forEach(anchor => anchor.href && !anchor.target && (anchor.onclick = () => {window.app.goto(anchor.href.replace(document.location.origin,''));return false}));
  }
  const setState = () => {
    (fireCallbacks('cleanup') || (delete callbacks.cleanup)) && (hooks = {});
    [route, ...params] = (useHash && window.location.hash.replace('#', '').replace(/^\//, '') || window.location.pathname.replace(/^\//, '')).replace(base.name, '').split(/\//g);
    route = templates[route] && route || 'dashboard';
    refresh();
  };
  const goto = (route) => {
    if(useHash) document.location.hash = route;
    else {
      route = document.location.origin + '/' + route.replace(/^\//, '');
      route !== document.location.pathname && window.history.pushState(route, null, route);
    }
    setState();
  };
  return {route,params,base,useHash,templates,controllers,callbacks,hooks,components,$,$$,fill,on,fireCallbacks,setState,goto,refresh,start: () => setState(),fns:{},vars:{}};
}
(typeof(module)!=='undefined') && (module.exports = Minifrdg) || (window.Minifrdg = Minifrdg)