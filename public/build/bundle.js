
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var app = (function () {
    'use strict';

    function noop() { }
    const identity = x => x;
    function is_promise(value) {
        return value && typeof value === 'object' && typeof value.then === 'function';
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    let src_url_equal_anchor;
    function src_url_equal(element_src, url) {
        if (!src_url_equal_anchor) {
            src_url_equal_anchor = document.createElement('a');
        }
        src_url_equal_anchor.href = url;
        return element_src === src_url_equal_anchor.href;
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function action_destroyer(action_result) {
        return action_result && is_function(action_result.destroy) ? action_result.destroy : noop;
    }

    const is_client = typeof window !== 'undefined';
    let now = is_client
        ? () => window.performance.now()
        : () => Date.now();
    let raf = is_client ? cb => requestAnimationFrame(cb) : noop;

    const tasks = new Set();
    function run_tasks(now) {
        tasks.forEach(task => {
            if (!task.c(now)) {
                tasks.delete(task);
                task.f();
            }
        });
        if (tasks.size !== 0)
            raf(run_tasks);
    }
    /**
     * Creates a new task that runs on each raf frame
     * until it returns a falsy value or is aborted
     */
    function loop(callback) {
        let task;
        if (tasks.size === 0)
            raf(run_tasks);
        return {
            promise: new Promise(fulfill => {
                tasks.add(task = { c: callback, f: fulfill });
            }),
            abort() {
                tasks.delete(task);
            }
        };
    }
    function append(target, node) {
        target.appendChild(node);
    }
    function get_root_for_style(node) {
        if (!node)
            return document;
        const root = node.getRootNode ? node.getRootNode() : node.ownerDocument;
        if (root && root.host) {
            return root;
        }
        return node.ownerDocument;
    }
    function append_empty_stylesheet(node) {
        const style_element = element('style');
        append_stylesheet(get_root_for_style(node), style_element);
        return style_element.sheet;
    }
    function append_stylesheet(node, style) {
        append(node.head || node, style);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function custom_event(type, detail, bubbles = false) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, false, detail);
        return e;
    }

    // we need to store the information for multiple documents because a Svelte application could also contain iframes
    // https://github.com/sveltejs/svelte/issues/3624
    const managed_styles = new Map();
    let active = 0;
    // https://github.com/darkskyapp/string-hash/blob/master/index.js
    function hash(str) {
        let hash = 5381;
        let i = str.length;
        while (i--)
            hash = ((hash << 5) - hash) ^ str.charCodeAt(i);
        return hash >>> 0;
    }
    function create_style_information(doc, node) {
        const info = { stylesheet: append_empty_stylesheet(node), rules: {} };
        managed_styles.set(doc, info);
        return info;
    }
    function create_rule(node, a, b, duration, delay, ease, fn, uid = 0) {
        const step = 16.666 / duration;
        let keyframes = '{\n';
        for (let p = 0; p <= 1; p += step) {
            const t = a + (b - a) * ease(p);
            keyframes += p * 100 + `%{${fn(t, 1 - t)}}\n`;
        }
        const rule = keyframes + `100% {${fn(b, 1 - b)}}\n}`;
        const name = `__svelte_${hash(rule)}_${uid}`;
        const doc = get_root_for_style(node);
        const { stylesheet, rules } = managed_styles.get(doc) || create_style_information(doc, node);
        if (!rules[name]) {
            rules[name] = true;
            stylesheet.insertRule(`@keyframes ${name} ${rule}`, stylesheet.cssRules.length);
        }
        const animation = node.style.animation || '';
        node.style.animation = `${animation ? `${animation}, ` : ''}${name} ${duration}ms linear ${delay}ms 1 both`;
        active += 1;
        return name;
    }
    function delete_rule(node, name) {
        const previous = (node.style.animation || '').split(', ');
        const next = previous.filter(name
            ? anim => anim.indexOf(name) < 0 // remove specific animation
            : anim => anim.indexOf('__svelte') === -1 // remove all Svelte animations
        );
        const deleted = previous.length - next.length;
        if (deleted) {
            node.style.animation = next.join(', ');
            active -= deleted;
            if (!active)
                clear_rules();
        }
    }
    function clear_rules() {
        raf(() => {
            if (active)
                return;
            managed_styles.forEach(info => {
                const { stylesheet } = info;
                let i = stylesheet.cssRules.length;
                while (i--)
                    stylesheet.deleteRule(i);
                info.rules = {};
            });
            managed_styles.clear();
        });
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    function add_flush_callback(fn) {
        flush_callbacks.push(fn);
    }
    // flush() calls callbacks in this order:
    // 1. All beforeUpdate callbacks, in order: parents before children
    // 2. All bind:this callbacks, in reverse order: children before parents.
    // 3. All afterUpdate callbacks, in order: parents before children. EXCEPT
    //    for afterUpdates called during the initial onMount, which are called in
    //    reverse order: children before parents.
    // Since callbacks might update component values, which could trigger another
    // call to flush(), the following steps guard against this:
    // 1. During beforeUpdate, any updated components will be added to the
    //    dirty_components array and will cause a reentrant call to flush(). Because
    //    the flush index is kept outside the function, the reentrant call will pick
    //    up where the earlier call left off and go through all dirty components. The
    //    current_component value is saved and restored so that the reentrant call will
    //    not interfere with the "parent" flush() call.
    // 2. bind:this callbacks cannot trigger new flush() calls.
    // 3. During afterUpdate, any updated components will NOT have their afterUpdate
    //    callback called a second time; the seen_callbacks set, outside the flush()
    //    function, guarantees this behavior.
    const seen_callbacks = new Set();
    let flushidx = 0; // Do *not* move this inside the flush() function
    function flush() {
        const saved_component = current_component;
        do {
            // first, call beforeUpdate functions
            // and update components
            while (flushidx < dirty_components.length) {
                const component = dirty_components[flushidx];
                flushidx++;
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            flushidx = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        seen_callbacks.clear();
        set_current_component(saved_component);
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }

    let promise;
    function wait() {
        if (!promise) {
            promise = Promise.resolve();
            promise.then(() => {
                promise = null;
            });
        }
        return promise;
    }
    function dispatch(node, direction, kind) {
        node.dispatchEvent(custom_event(`${direction ? 'intro' : 'outro'}${kind}`));
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }
    const null_transition = { duration: 0 };
    function create_in_transition(node, fn, params) {
        let config = fn(node, params);
        let running = false;
        let animation_name;
        let task;
        let uid = 0;
        function cleanup() {
            if (animation_name)
                delete_rule(node, animation_name);
        }
        function go() {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            if (css)
                animation_name = create_rule(node, 0, 1, duration, delay, easing, css, uid++);
            tick(0, 1);
            const start_time = now() + delay;
            const end_time = start_time + duration;
            if (task)
                task.abort();
            running = true;
            add_render_callback(() => dispatch(node, true, 'start'));
            task = loop(now => {
                if (running) {
                    if (now >= end_time) {
                        tick(1, 0);
                        dispatch(node, true, 'end');
                        cleanup();
                        return running = false;
                    }
                    if (now >= start_time) {
                        const t = easing((now - start_time) / duration);
                        tick(t, 1 - t);
                    }
                }
                return running;
            });
        }
        let started = false;
        return {
            start() {
                if (started)
                    return;
                started = true;
                delete_rule(node);
                if (is_function(config)) {
                    config = config();
                    wait().then(go);
                }
                else {
                    go();
                }
            },
            invalidate() {
                started = false;
            },
            end() {
                if (running) {
                    cleanup();
                    running = false;
                }
            }
        };
    }
    function create_out_transition(node, fn, params) {
        let config = fn(node, params);
        let running = true;
        let animation_name;
        const group = outros;
        group.r += 1;
        function go() {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            if (css)
                animation_name = create_rule(node, 1, 0, duration, delay, easing, css);
            const start_time = now() + delay;
            const end_time = start_time + duration;
            add_render_callback(() => dispatch(node, false, 'start'));
            loop(now => {
                if (running) {
                    if (now >= end_time) {
                        tick(0, 1);
                        dispatch(node, false, 'end');
                        if (!--group.r) {
                            // this will result in `end()` being called,
                            // so we don't need to clean up here
                            run_all(group.c);
                        }
                        return false;
                    }
                    if (now >= start_time) {
                        const t = easing((now - start_time) / duration);
                        tick(1 - t, t);
                    }
                }
                return running;
            });
        }
        if (is_function(config)) {
            wait().then(() => {
                // @ts-ignore
                config = config();
                go();
            });
        }
        else {
            go();
        }
        return {
            end(reset) {
                if (reset && config.tick) {
                    config.tick(1, 0);
                }
                if (running) {
                    if (animation_name)
                        delete_rule(node, animation_name);
                    running = false;
                }
            }
        };
    }
    function create_bidirectional_transition(node, fn, params, intro) {
        let config = fn(node, params);
        let t = intro ? 0 : 1;
        let running_program = null;
        let pending_program = null;
        let animation_name = null;
        function clear_animation() {
            if (animation_name)
                delete_rule(node, animation_name);
        }
        function init(program, duration) {
            const d = (program.b - t);
            duration *= Math.abs(d);
            return {
                a: t,
                b: program.b,
                d,
                duration,
                start: program.start,
                end: program.start + duration,
                group: program.group
            };
        }
        function go(b) {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            const program = {
                start: now() + delay,
                b
            };
            if (!b) {
                // @ts-ignore todo: improve typings
                program.group = outros;
                outros.r += 1;
            }
            if (running_program || pending_program) {
                pending_program = program;
            }
            else {
                // if this is an intro, and there's a delay, we need to do
                // an initial tick and/or apply CSS animation immediately
                if (css) {
                    clear_animation();
                    animation_name = create_rule(node, t, b, duration, delay, easing, css);
                }
                if (b)
                    tick(0, 1);
                running_program = init(program, duration);
                add_render_callback(() => dispatch(node, b, 'start'));
                loop(now => {
                    if (pending_program && now > pending_program.start) {
                        running_program = init(pending_program, duration);
                        pending_program = null;
                        dispatch(node, running_program.b, 'start');
                        if (css) {
                            clear_animation();
                            animation_name = create_rule(node, t, running_program.b, running_program.duration, 0, easing, config.css);
                        }
                    }
                    if (running_program) {
                        if (now >= running_program.end) {
                            tick(t = running_program.b, 1 - t);
                            dispatch(node, running_program.b, 'end');
                            if (!pending_program) {
                                // we're done
                                if (running_program.b) {
                                    // intro — we can tidy up immediately
                                    clear_animation();
                                }
                                else {
                                    // outro — needs to be coordinated
                                    if (!--running_program.group.r)
                                        run_all(running_program.group.c);
                                }
                            }
                            running_program = null;
                        }
                        else if (now >= running_program.start) {
                            const p = now - running_program.start;
                            t = running_program.a + running_program.d * easing(p / running_program.duration);
                            tick(t, 1 - t);
                        }
                    }
                    return !!(running_program || pending_program);
                });
            }
        }
        return {
            run(b) {
                if (is_function(config)) {
                    wait().then(() => {
                        // @ts-ignore
                        config = config();
                        go(b);
                    });
                }
                else {
                    go(b);
                }
            },
            end() {
                clear_animation();
                running_program = pending_program = null;
            }
        };
    }

    function handle_promise(promise, info) {
        const token = info.token = {};
        function update(type, index, key, value) {
            if (info.token !== token)
                return;
            info.resolved = value;
            let child_ctx = info.ctx;
            if (key !== undefined) {
                child_ctx = child_ctx.slice();
                child_ctx[key] = value;
            }
            const block = type && (info.current = type)(child_ctx);
            let needs_flush = false;
            if (info.block) {
                if (info.blocks) {
                    info.blocks.forEach((block, i) => {
                        if (i !== index && block) {
                            group_outros();
                            transition_out(block, 1, 1, () => {
                                if (info.blocks[i] === block) {
                                    info.blocks[i] = null;
                                }
                            });
                            check_outros();
                        }
                    });
                }
                else {
                    info.block.d(1);
                }
                block.c();
                transition_in(block, 1);
                block.m(info.mount(), info.anchor);
                needs_flush = true;
            }
            info.block = block;
            if (info.blocks)
                info.blocks[index] = block;
            if (needs_flush) {
                flush();
            }
        }
        if (is_promise(promise)) {
            const current_component = get_current_component();
            promise.then(value => {
                set_current_component(current_component);
                update(info.then, 1, info.value, value);
                set_current_component(null);
            }, error => {
                set_current_component(current_component);
                update(info.catch, 2, info.error, error);
                set_current_component(null);
                if (!info.hasCatch) {
                    throw error;
                }
            });
            // if we previously had a then/catch block, destroy it
            if (info.current !== info.pending) {
                update(info.pending, 0);
                return true;
            }
        }
        else {
            if (info.current !== info.then) {
                update(info.then, 1, info.value, promise);
                return true;
            }
            info.resolved = promise;
        }
    }
    function update_await_block_branch(info, ctx, dirty) {
        const child_ctx = ctx.slice();
        const { resolved } = info;
        if (info.current === info.then) {
            child_ctx[info.value] = resolved;
        }
        if (info.current === info.catch) {
            child_ctx[info.error] = resolved;
        }
        info.block.p(child_ctx, dirty);
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);

    function bind(component, name, callback) {
        const index = component.$$.props[name];
        if (index !== undefined) {
            component.$$.bound[index] = callback;
            callback(component.$$.ctx[index]);
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = on_mount.map(run).filter(is_function);
                if (on_destroy) {
                    on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false,
            root: options.target || parent_component.$$.root
        };
        append_styles && append_styles($$.root);
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.46.2' }, detail), true));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    function cubicOut(t) {
        const f = t - 1.0;
        return f * f * f + 1.0;
    }

    function fade(node, { delay = 0, duration = 400, easing = identity } = {}) {
        const o = +getComputedStyle(node).opacity;
        return {
            delay,
            duration,
            easing,
            css: t => `opacity: ${t * o}`
        };
    }
    function fly(node, { delay = 0, duration = 400, easing = cubicOut, x = 0, y = 0, opacity = 0 } = {}) {
        const style = getComputedStyle(node);
        const target_opacity = +style.opacity;
        const transform = style.transform === 'none' ? '' : style.transform;
        const od = target_opacity * (1 - opacity);
        return {
            delay,
            duration,
            easing,
            css: (t, u) => `
			transform: ${transform} translate(${(1 - t) * x}px, ${(1 - t) * y}px);
			opacity: ${target_opacity - (od * u)}`
        };
    }

    /* src/components/animationLogo.svelte generated by Svelte v3.46.2 */
    const file$3 = "src/components/animationLogo.svelte";

    function create_fragment$3(ctx) {
    	let canvas_1;
    	let canvas_1_transition;
    	let current;

    	const block = {
    		c: function create() {
    			canvas_1 = element("canvas");
    			attr_dev(canvas_1, "width", 32);
    			attr_dev(canvas_1, "height", 32);
    			attr_dev(canvas_1, "class", "svelte-1oq0yfo");
    			add_location(canvas_1, file$3, 39, 0, 1124);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, canvas_1, anchor);
    			/*canvas_1_binding*/ ctx[1](canvas_1);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (!canvas_1_transition) canvas_1_transition = create_bidirectional_transition(canvas_1, fade, {}, true);
    				canvas_1_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (!canvas_1_transition) canvas_1_transition = create_bidirectional_transition(canvas_1, fade, {}, false);
    			canvas_1_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(canvas_1);
    			/*canvas_1_binding*/ ctx[1](null);
    			if (detaching && canvas_1_transition) canvas_1_transition.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('AnimationLogo', slots, []);
    	let canvas;

    	onMount(() => {
    		const ctx = canvas.getContext('2d');
    		let frame = requestAnimationFrame(loop);

    		function loop(t) {
    			frame = requestAnimationFrame(loop);
    			const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

    			for (let p = 0; p < imageData.data.length; p += 4) {
    				const i = p / 4;
    				const x = i % canvas.width;
    				const y = i / canvas.width >>> 0;
    				const r = 64 + 128 * x / canvas.width + 64 * Math.sin(t / 1000);
    				const g = 64 + 128 * y / canvas.height + 64 * Math.cos(t / 1000);
    				const b = 128;
    				imageData.data[p + 0] = r;
    				imageData.data[p + 1] = g;
    				imageData.data[p + 2] = b;
    				imageData.data[p + 3] = 255;
    			}

    			ctx.putImageData(imageData, 0, 0);
    		}

    		return () => {
    			cancelAnimationFrame(frame);
    		};
    	});

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<AnimationLogo> was created with unknown prop '${key}'`);
    	});

    	function canvas_1_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			canvas = $$value;
    			$$invalidate(0, canvas);
    		});
    	}

    	$$self.$capture_state = () => ({ onMount, fade, canvas });

    	$$self.$inject_state = $$props => {
    		if ('canvas' in $$props) $$invalidate(0, canvas = $$props.canvas);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [canvas, canvas_1_binding];
    }

    class AnimationLogo extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "AnimationLogo",
    			options,
    			id: create_fragment$3.name
    		});
    	}
    }

    function styles(node, styles) {
        setCustomProperties(node, styles);

        return {
            update(styles) {
                setCustomProperties(node, styles);
            }
        };
    }

    function setCustomProperties(node, styles) {
        Object.entries(styles).forEach(([key, value]) => {
            node.style.setProperty(`--${key}`, value);
        });
    }

    /* src/components/scrollerBlock.svelte generated by Svelte v3.46.2 */
    const file$2 = "src/components/scrollerBlock.svelte";

    // (14:4) { #if svgSource }
    function create_if_block$2(ctx) {
    	let div;
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			div = element("div");
    			img = element("img");
    			if (!src_url_equal(img.src, img_src_value = /*svgSource*/ ctx[2])) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "class", "svelte-v0xx89");
    			add_location(img, file$2, 15, 12, 451);
    			attr_dev(div, "class", "sourceGraph svelte-v0xx89");
    			add_location(div, file$2, 14, 8, 413);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, img);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*svgSource*/ 4 && !src_url_equal(img.src, img_src_value = /*svgSource*/ ctx[2])) {
    				attr_dev(img, "src", img_src_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(14:4) { #if svgSource }",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let div;
    	let h2;
    	let t0;
    	let t1;
    	let p;
    	let t2;
    	let t3;
    	let div_class_value;
    	let div_transition;
    	let current;
    	let if_block = /*svgSource*/ ctx[2] && create_if_block$2(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			h2 = element("h2");
    			t0 = text(/*title*/ ctx[0]);
    			t1 = space();
    			p = element("p");
    			t2 = text(/*text*/ ctx[1]);
    			t3 = space();
    			if (if_block) if_block.c();
    			attr_dev(h2, "class", "svelte-v0xx89");
    			add_location(h2, file$2, 11, 4, 348);
    			attr_dev(p, "class", "svelte-v0xx89");
    			add_location(p, file$2, 12, 4, 369);
    			attr_dev(div, "class", div_class_value = "scrollerBlock " + /*position*/ ctx[3] + " " + `${/*downed*/ ctx[4] ? "downed" : ""}` + " svelte-v0xx89");
    			add_location(div, file$2, 10, 0, 200);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, h2);
    			append_dev(h2, t0);
    			append_dev(div, t1);
    			append_dev(div, p);
    			append_dev(p, t2);
    			append_dev(div, t3);
    			if (if_block) if_block.m(div, null);
    			current = true;
    		},
    		p: function update(new_ctx, [dirty]) {
    			ctx = new_ctx;
    			if (!current || dirty & /*title*/ 1) set_data_dev(t0, /*title*/ ctx[0]);
    			if (!current || dirty & /*text*/ 2) set_data_dev(t2, /*text*/ ctx[1]);

    			if (/*svgSource*/ ctx[2]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$2(ctx);
    					if_block.c();
    					if_block.m(div, null);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			if (!current || dirty & /*position, downed*/ 24 && div_class_value !== (div_class_value = "scrollerBlock " + /*position*/ ctx[3] + " " + `${/*downed*/ ctx[4] ? "downed" : ""}` + " svelte-v0xx89")) {
    				attr_dev(div, "class", div_class_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (!div_transition) div_transition = create_bidirectional_transition(
    					div,
    					fly,
    					{
    						x: /*position*/ ctx[3] === 'left' ? -200 : 200,
    						duration: 1000
    					},
    					true
    				);

    				div_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (!div_transition) div_transition = create_bidirectional_transition(
    				div,
    				fly,
    				{
    					x: /*position*/ ctx[3] === 'left' ? -200 : 200,
    					duration: 1000
    				},
    				false
    			);

    			div_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (if_block) if_block.d();
    			if (detaching && div_transition) div_transition.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('ScrollerBlock', slots, []);
    	let { title } = $$props;
    	let { text } = $$props;
    	let { svgSource } = $$props;
    	let { position = 'left' } = $$props;
    	let { downed = false } = $$props;
    	const writable_props = ['title', 'text', 'svgSource', 'position', 'downed'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<ScrollerBlock> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('title' in $$props) $$invalidate(0, title = $$props.title);
    		if ('text' in $$props) $$invalidate(1, text = $$props.text);
    		if ('svgSource' in $$props) $$invalidate(2, svgSource = $$props.svgSource);
    		if ('position' in $$props) $$invalidate(3, position = $$props.position);
    		if ('downed' in $$props) $$invalidate(4, downed = $$props.downed);
    	};

    	$$self.$capture_state = () => ({
    		fly,
    		title,
    		text,
    		svgSource,
    		position,
    		downed
    	});

    	$$self.$inject_state = $$props => {
    		if ('title' in $$props) $$invalidate(0, title = $$props.title);
    		if ('text' in $$props) $$invalidate(1, text = $$props.text);
    		if ('svgSource' in $$props) $$invalidate(2, svgSource = $$props.svgSource);
    		if ('position' in $$props) $$invalidate(3, position = $$props.position);
    		if ('downed' in $$props) $$invalidate(4, downed = $$props.downed);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [title, text, svgSource, position, downed];
    }

    class ScrollerBlock extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {
    			title: 0,
    			text: 1,
    			svgSource: 2,
    			position: 3,
    			downed: 4
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ScrollerBlock",
    			options,
    			id: create_fragment$2.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*title*/ ctx[0] === undefined && !('title' in props)) {
    			console.warn("<ScrollerBlock> was created without expected prop 'title'");
    		}

    		if (/*text*/ ctx[1] === undefined && !('text' in props)) {
    			console.warn("<ScrollerBlock> was created without expected prop 'text'");
    		}

    		if (/*svgSource*/ ctx[2] === undefined && !('svgSource' in props)) {
    			console.warn("<ScrollerBlock> was created without expected prop 'svgSource'");
    		}
    	}

    	get title() {
    		throw new Error("<ScrollerBlock>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set title(value) {
    		throw new Error("<ScrollerBlock>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get text() {
    		throw new Error("<ScrollerBlock>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set text(value) {
    		throw new Error("<ScrollerBlock>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get svgSource() {
    		throw new Error("<ScrollerBlock>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set svgSource(value) {
    		throw new Error("<ScrollerBlock>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get position() {
    		throw new Error("<ScrollerBlock>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set position(value) {
    		throw new Error("<ScrollerBlock>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get downed() {
    		throw new Error("<ScrollerBlock>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set downed(value) {
    		throw new Error("<ScrollerBlock>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/animationScroller.svelte generated by Svelte v3.46.2 */

    const { window: window_1$1 } = globals;
    const file$1 = "src/components/animationScroller.svelte";

    // (1:0) <script>     import { styles }
    function create_catch_block(ctx) {
    	const block = {
    		c: noop,
    		m: noop,
    		p: noop,
    		i: noop,
    		o: noop,
    		d: noop
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_catch_block.name,
    		type: "catch",
    		source: "(1:0) <script>     import { styles }",
    		ctx
    	});

    	return block;
    }

    // (228:0) {:then _}
    function create_then_block(ctx) {
    	let div;
    	let if_block = /*source*/ ctx[3] && create_if_block_2(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (if_block) if_block.c();
    			attr_dev(div, "class", "backgroundAnimation svelte-jin6qg");
    			add_location(div, file$1, 228, 4, 9687);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			if (if_block) if_block.m(div, null);
    		},
    		p: function update(ctx, dirty) {
    			if (/*source*/ ctx[3]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block_2(ctx);
    					if_block.c();
    					if_block.m(div, null);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (if_block) if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_then_block.name,
    		type: "then",
    		source: "(228:0) {:then _}",
    		ctx
    	});

    	return block;
    }

    // (230:8) {#if source}
    function create_if_block_2(ctx) {
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			img = element("img");
    			if (!src_url_equal(img.src, img_src_value = /*source*/ ctx[3])) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "");
    			attr_dev(img, "class", "svelte-jin6qg");
    			add_location(img, file$1, 230, 12, 9754);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, img, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*source*/ 8 && !src_url_equal(img.src, img_src_value = /*source*/ ctx[3])) {
    				attr_dev(img, "src", img_src_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(img);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(230:8) {#if source}",
    		ctx
    	});

    	return block;
    }

    // (226:18)      <AnimationLogo /> {:then _}
    function create_pending_block(ctx) {
    	let animationlogo;
    	let current;
    	animationlogo = new AnimationLogo({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(animationlogo.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(animationlogo, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(animationlogo.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(animationlogo.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(animationlogo, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_pending_block.name,
    		type: "pending",
    		source: "(226:18)      <AnimationLogo /> {:then _}",
    		ctx
    	});

    	return block;
    }

    // (236:0) { #if scrollToBlock[frameNumber] }
    function create_if_block_1(ctx) {
    	let scrollerblock;
    	let current;

    	scrollerblock = new ScrollerBlock({
    			props: {
    				title: /*scrollToBlock*/ ctx[4][/*frameNumber*/ ctx[1]].title,
    				text: /*scrollToBlock*/ ctx[4][/*frameNumber*/ ctx[1]].text,
    				svgSource: /*scrollToBlock*/ ctx[4][/*frameNumber*/ ctx[1]].src,
    				position: /*scrollToBlock*/ ctx[4][/*frameNumber*/ ctx[1]].position || 'left',
    				downed: /*scrollToBlock*/ ctx[4][/*frameNumber*/ ctx[1]].id === 'laser'
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(scrollerblock.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(scrollerblock, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const scrollerblock_changes = {};
    			if (dirty & /*frameNumber*/ 2) scrollerblock_changes.title = /*scrollToBlock*/ ctx[4][/*frameNumber*/ ctx[1]].title;
    			if (dirty & /*frameNumber*/ 2) scrollerblock_changes.text = /*scrollToBlock*/ ctx[4][/*frameNumber*/ ctx[1]].text;
    			if (dirty & /*frameNumber*/ 2) scrollerblock_changes.svgSource = /*scrollToBlock*/ ctx[4][/*frameNumber*/ ctx[1]].src;
    			if (dirty & /*frameNumber*/ 2) scrollerblock_changes.position = /*scrollToBlock*/ ctx[4][/*frameNumber*/ ctx[1]].position || 'left';
    			if (dirty & /*frameNumber*/ 2) scrollerblock_changes.downed = /*scrollToBlock*/ ctx[4][/*frameNumber*/ ctx[1]].id === 'laser';
    			scrollerblock.$set(scrollerblock_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(scrollerblock.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(scrollerblock.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(scrollerblock, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(236:0) { #if scrollToBlock[frameNumber] }",
    		ctx
    	});

    	return block;
    }

    // (245:0) { #if frameMapper[scrollValue] > 1111 }
    function create_if_block$1(ctx) {
    	let div;
    	let a;
    	let span;

    	const block = {
    		c: function create() {
    			div = element("div");
    			a = element("a");
    			span = element("span");
    			attr_dev(span, "class", "svelte-jin6qg");
    			add_location(span, file$1, 247, 12, 10323);
    			attr_dev(a, "href", "https://www.instagram.com/vizualove/");
    			add_location(a, file$1, 246, 8, 10263);
    			attr_dev(div, "class", "linker svelte-jin6qg");
    			add_location(div, file$1, 245, 4, 10234);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, a);
    			append_dev(a, span);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(245:0) { #if frameMapper[scrollValue] > 1111 }",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let scrolling = false;

    	let clear_scrolling = () => {
    		scrolling = false;
    	};

    	let scrolling_timeout;
    	let div;
    	let t0;
    	let t1;
    	let t2;
    	let if_block1_anchor;
    	let current;
    	let mounted;
    	let dispose;
    	add_render_callback(/*onwindowscroll*/ ctx[9]);
    	add_render_callback(/*onwindowresize*/ ctx[10]);

    	let info = {
    		ctx,
    		current: null,
    		token: null,
    		hasCatch: false,
    		pending: create_pending_block,
    		then: create_then_block,
    		catch: create_catch_block,
    		value: 15,
    		blocks: [,,,]
    	};

    	handle_promise(/*preload*/ ctx[7](), info);
    	let if_block0 = /*scrollToBlock*/ ctx[4][/*frameNumber*/ ctx[1]] && create_if_block_1(ctx);
    	let if_block1 = /*frameMapper*/ ctx[6][/*scrollValue*/ ctx[0]] > 1111 && create_if_block$1(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			t0 = space();
    			info.block.c();
    			t1 = space();
    			if (if_block0) if_block0.c();
    			t2 = space();
    			if (if_block1) if_block1.c();
    			if_block1_anchor = empty();
    			attr_dev(div, "class", "scrollSpacer svelte-jin6qg");
    			add_location(div, file$1, 216, 0, 9420);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			insert_dev(target, t0, anchor);
    			info.block.m(target, info.anchor = anchor);
    			info.mount = () => t1.parentNode;
    			info.anchor = t1;
    			insert_dev(target, t1, anchor);
    			if (if_block0) if_block0.m(target, anchor);
    			insert_dev(target, t2, anchor);
    			if (if_block1) if_block1.m(target, anchor);
    			insert_dev(target, if_block1_anchor, anchor);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(window_1$1, "scroll", () => {
    						scrolling = true;
    						clearTimeout(scrolling_timeout);
    						scrolling_timeout = setTimeout(clear_scrolling, 100);
    						/*onwindowscroll*/ ctx[9]();
    					}),
    					listen_dev(window_1$1, "resize", /*onwindowresize*/ ctx[10]),
    					action_destroyer(styles.call(null, div, { calcHeight: /*calcHeight*/ ctx[5] }))
    				];

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, [dirty]) {
    			ctx = new_ctx;

    			if (dirty & /*scrollValue*/ 1 && !scrolling) {
    				scrolling = true;
    				clearTimeout(scrolling_timeout);
    				scrollTo(window_1$1.pageXOffset, /*scrollValue*/ ctx[0]);
    				scrolling_timeout = setTimeout(clear_scrolling, 100);
    			}

    			update_await_block_branch(info, ctx, dirty);

    			if (/*scrollToBlock*/ ctx[4][/*frameNumber*/ ctx[1]]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);

    					if (dirty & /*frameNumber*/ 2) {
    						transition_in(if_block0, 1);
    					}
    				} else {
    					if_block0 = create_if_block_1(ctx);
    					if_block0.c();
    					transition_in(if_block0, 1);
    					if_block0.m(t2.parentNode, t2);
    				}
    			} else if (if_block0) {
    				group_outros();

    				transition_out(if_block0, 1, 1, () => {
    					if_block0 = null;
    				});

    				check_outros();
    			}

    			if (/*frameMapper*/ ctx[6][/*scrollValue*/ ctx[0]] > 1111) {
    				if (if_block1) ; else {
    					if_block1 = create_if_block$1(ctx);
    					if_block1.c();
    					if_block1.m(if_block1_anchor.parentNode, if_block1_anchor);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(info.block);
    			transition_in(if_block0);
    			current = true;
    		},
    		o: function outro(local) {
    			for (let i = 0; i < 3; i += 1) {
    				const block = info.blocks[i];
    				transition_out(block);
    			}

    			transition_out(if_block0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (detaching) detach_dev(t0);
    			info.block.d(detaching);
    			info.token = null;
    			info = null;
    			if (detaching) detach_dev(t1);
    			if (if_block0) if_block0.d(detaching);
    			if (detaching) detach_dev(t2);
    			if (if_block1) if_block1.d(detaching);
    			if (detaching) detach_dev(if_block1_anchor);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const COMMON_DURATION = 500;
    const framesCount = 1116;
    const pixelsPerScroll = 20;

    function instance$1($$self, $$props, $$invalidate) {
    	let frameNumber;
    	let source;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('AnimationScroller', slots, []);

    	const infoBlocks = [
    		{
    			id: 'stars',
    			stopFrame: 168,
    			duration: COMMON_DURATION,
    			title: 'Hvězdy',
    			text: 'Světlo vzniká chemickou reakcí v jádru hvězdy – termonukleární fúze vodíku na helium.\n' + 'Tato reakce uvolňuje energii v podobě záření procházející hvězdou ven.',
    			position: 'right',
    			src: '/assets/graphs/stars.png'
    		},
    		{
    			id: 'sun',
    			stopFrame: 224,
    			duration: COMMON_DURATION,
    			title: 'Slunce',
    			text: 'Světlo vzniká chemickou reakcí v jádru hvězdy – termonukleární fúze vodíku na helium.\n' + 'Tato reakce uvolňuje energii v podobě záření procházející hvězdou ven.',
    			position: 'right',
    			src: '/assets/graphs/sun.png'
    		},
    		{
    			id: 'rad',
    			stopFrame: 319,
    			duration: COMMON_DURATION,
    			title: 'Radiace',
    			text: 'Emise energie ve formě vlnění (elektromagnetického záření) nebo částic skrze prostor či  hmotu.\n' + 'Záření vzniká z hvězd, akrečních disků (rozptýlený materiál obíhající okolo tělesa jako např. hvězdy nebo černé díry), reliktního záření z období po velkém třesku, mezihvězdného mračna (uskupení plynu, plazmatu a prachu v galaxiích)',
    			src: '/assets/graphs/rad.png'
    		},
    		{
    			id: 'polar',
    			stopFrame: 389,
    			duration: COMMON_DURATION,
    			title: 'Polární záře',
    			text: 'Na Slunci vznikají vlivem nerovností v magnetickém poli sluneční skvrny, u kterých vznikne masivní erupce. Mrak částic z protonů, elektronů a alfa částic letí vesmírem. Část se ho stáčí po spirálách směrem k magnetickým pólům Země, sráží se s atmosférou a emituje se elektromagnetické záření ve viditelném spektru.\n' + 'Je jevem tzv. vesmírného počasí.',
    			position: 'right',
    			src: '/assets/graphs/polar.png'
    		},
    		{
    			id: 'lightning',
    			stopFrame: 454,
    			duration: COMMON_DURATION,
    			title: 'Blesk',
    			text: 'Přiblížením kladně nabitého oblaku k záporně nabitému vznikne vysoké elektrické napětí, které se vyrovná světelným výbojem – bleskem. To samé může nastat mezi mrakem a zemí.',
    			src: '/assets/graphs/lightning.png'
    		},
    		{
    			id: 'mushrooms',
    			stopFrame: 533,
    			duration: COMMON_DURATION,
    			title: 'Bioluminiscenční Houby',
    			text: 'Světlo vzniká chemickou reakcí kyslíku, vápníku a luciferinu za přítomnosti luciferázy. Při reakci se uvolňuje energie v podobě světla a tepla (bioluminiscence). Více než 80 % energie je emitováno v podobě světla',
    			position: 'right'
    		},
    		{
    			id: 'jellyfish',
    			stopFrame: 606,
    			duration: COMMON_DURATION,
    			title: 'Medúza',
    			text: 'Světlo vzniká chemickou reakcí kyslíku, vápníku a luciferinu za přítomnosti luciferázy. Při reakci se uvolňuje energie v podobě světla a tepla (bioluminiscence). Více než 80 % energie je emitováno v podobě světla'
    		},
    		{
    			id: 'fire',
    			stopFrame: 744,
    			duration: COMMON_DURATION,
    			title: 'Oheň',
    			text: 'Vzniká hořením, tedy chemickou reakcí mezi hořlavinou, kyslíkem a zdrojem iniciace, při které se uvolňuje energie v podobě tepla a světla.',
    			src: '/assets/graphs/fire.png'
    		},
    		{
    			id: 'bulb',
    			stopFrame: 828,
    			duration: COMMON_DURATION,
    			title: 'Žárovka',
    			text: 'Světlo je vyzařováno wolframovým vodičem (vláknem) zahřátým elektrickým proudem na vysokou teplotu. Většina energie je ztracena vyzařovaným teplem.',
    			position: 'right',
    			src: '/assets/graphs/bulb.png'
    		},
    		{
    			id: 'lamp',
    			stopFrame: 880,
    			duration: COMMON_DURATION,
    			title: 'Zářivka',
    			text: 'Elektrony se srážejí s atomy rtuti. Elektrony atomů rtuti mají tak nestabilní hladinu energie. Aby se tyto elektrony dostaly na stabilní (nižší) hladinu energie, emitují záření v převážně ultrafialových délkách, ty jsou látkou luminofor odráženy ve formě viditelného světla.\n' + 'Zářivky jsou efektivnější než žárovky (méně tepla, více světla).\n',
    			position: 'right',
    			src: '/assets/graphs/lamp.png'
    		},
    		{
    			id: 'mac',
    			stopFrame: 967,
    			duration: COMMON_DURATION,
    			title: 'Monitor',
    			text: 'Light-Emitting Diode funuje na principu elektroluminiscence, tedy luminiscence, při níž dochází k přeměně elektrické energie ve světlo při průchodu proudu vhodným materiálem (luminoforem), na rozdíl od emise světla (incandescence) nebo od reakce různých chemikálií (chemiluminiscence).',
    			src: '/assets/graphs/mac.png'
    		},
    		{
    			id: 'laser',
    			stopFrame: 1056,
    			duration: COMMON_DURATION,
    			title: 'Laser',
    			text: 'Výbojka (trubice naplněná směsí plynů s elektrickým vodičem) dodává energii do aktivního prostředí (obvykle směs plynů), kde vybudí elektrony na vyšší, nestabilní energetickou hladinu.',
    			position: 'right',
    			src: '/assets/graphs/laser.png'
    		}
    	].sort((a, b) => a.stopFrame - b.stopFrame);

    	const scrollToBlock = infoBlocks.reduce((prev, curr) => ({ ...prev, [curr.stopFrame]: curr }), {});

    	// function calculateFrame(currentScroll) { // 720
    	//     const currentFrame = Math.floor(currentScroll / 20); // 36
    	//     let toAdd = 0; // 500
    	//     let offsetFrame = currentFrame;
    	//     for (const block of infoBlocks) {
    	//         if (offsetFrame >= block.stopFrame) {
    	//             toAdd += block.duration;
    	//             offsetFrame = Math.floor((currentScroll - toAdd) / 20); // 11
    	//             if (offsetFrame <= block.stopFrame) {
    	//                 return block.stopFrame;
    	//             }
    	//         }
    	//     }
    	//     console.log('TOADD', toAdd);
    	//     return Math.floor((currentScroll - toAdd) / 20);
    	// }
    	let windowHeight = window.innerHeight;

    	let scrollValue = 0;
    	let blockScrollValue = 0;
    	let scrollEnabled = true;
    	let { loaded = false } = $$props;
    	const calcHeightValue = framesCount * pixelsPerScroll + windowHeight + infoBlocks.reduce((prev, curr) => prev + curr.duration, 0);
    	const calcHeight = `${framesCount * pixelsPerScroll + windowHeight + infoBlocks.reduce((prev, curr) => prev + curr.duration, 0)}px`;

    	const frameMapper = [
    		...Array(framesCount * pixelsPerScroll + windowHeight + infoBlocks.reduce((prev, curr) => prev + curr.duration, 0)).keys()
    	].map(scrollVal => {
    		const currentFrame = Math.floor(scrollVal / 20); // 36
    		let toAdd = 0; // 500
    		let offsetFrame = currentFrame;

    		for (const block of infoBlocks) {
    			if (offsetFrame >= block.stopFrame) {
    				toAdd += block.duration;
    				offsetFrame = Math.floor((scrollVal - toAdd) / 20); // 11

    				if (offsetFrame <= block.stopFrame) {
    					return block.stopFrame;
    				}
    			}
    		}

    		return Math.floor((scrollVal - toAdd) / 20);
    	});

    	async function preload() {
    		const chunkSize = 50;
    		let tempArray;

    		for (let i = 0; i < framesCount; i += chunkSize) {
    			tempArray = [];

    			for (let j = 0; j < chunkSize; j++) {
    				const number = i + j;
    				if (number >= framesCount) break;

    				tempArray.push(new Promise(resolve => {
    						const img = new Image();
    						img.onload = resolve;
    						img.src = `/assets/animation/animation_frame${number + 1}.jpg`;
    					}));
    			}

    			await Promise.all(tempArray);
    		}

    		// const framesArray = [...Array(framesCount).keys()].map(number =>
    		//     new Promise((resolve => {
    		//         const img = new Image();
    		//         img.onload = resolve;
    		//         img.src = `/assets/animation/animation_frame${number + 1}.jpg`;
    		//     }))
    		// );
    		const graphsArray = infoBlocks.map(item => item.src
    		? new Promise(resolve => {
    					const img = new Image();
    					img.onload = resolve;
    					img.src = item.src;
    				})
    		: null).filter(Boolean);

    		// await Promise.all(framesArray);
    		await Promise.all(graphsArray);

    		$$invalidate(8, loaded = true);
    		return Promise.resolve();
    	}

    	const writable_props = ['loaded'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<AnimationScroller> was created with unknown prop '${key}'`);
    	});

    	function onwindowscroll() {
    		$$invalidate(0, scrollValue = window_1$1.pageYOffset);
    	}

    	function onwindowresize() {
    		$$invalidate(2, windowHeight = window_1$1.innerHeight);
    	}

    	$$self.$$set = $$props => {
    		if ('loaded' in $$props) $$invalidate(8, loaded = $$props.loaded);
    	};

    	$$self.$capture_state = () => ({
    		styles,
    		ScrollerBlock,
    		AnimationLogo,
    		COMMON_DURATION,
    		infoBlocks,
    		scrollToBlock,
    		windowHeight,
    		scrollValue,
    		blockScrollValue,
    		scrollEnabled,
    		loaded,
    		framesCount,
    		pixelsPerScroll,
    		calcHeightValue,
    		calcHeight,
    		frameMapper,
    		preload,
    		frameNumber,
    		source
    	});

    	$$self.$inject_state = $$props => {
    		if ('windowHeight' in $$props) $$invalidate(2, windowHeight = $$props.windowHeight);
    		if ('scrollValue' in $$props) $$invalidate(0, scrollValue = $$props.scrollValue);
    		if ('blockScrollValue' in $$props) blockScrollValue = $$props.blockScrollValue;
    		if ('scrollEnabled' in $$props) scrollEnabled = $$props.scrollEnabled;
    		if ('loaded' in $$props) $$invalidate(8, loaded = $$props.loaded);
    		if ('frameNumber' in $$props) $$invalidate(1, frameNumber = $$props.frameNumber);
    		if ('source' in $$props) $$invalidate(3, source = $$props.source);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*scrollValue*/ 1) {
    			$$invalidate(1, frameNumber = frameMapper[Math.floor(scrollValue)]);
    		}

    		if ($$self.$$.dirty & /*scrollValue, frameNumber*/ 3) {
    			// $: {
    			//     console.log('SCROLL', scrollValue);
    			//     console.log('FRAME', frameMapper[scrollValue]);
    			// }
    			$$invalidate(3, source = scrollValue > 20
    			? `/assets/animation/animation_frame${Math.min(frameNumber, framesCount)}.jpg`
    			: '');
    		}
    	};

    	return [
    		scrollValue,
    		frameNumber,
    		windowHeight,
    		source,
    		scrollToBlock,
    		calcHeight,
    		frameMapper,
    		preload,
    		loaded,
    		onwindowscroll,
    		onwindowresize
    	];
    }

    class AnimationScroller extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, { loaded: 8 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "AnimationScroller",
    			options,
    			id: create_fragment$1.name
    		});
    	}

    	get loaded() {
    		throw new Error("<AnimationScroller>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set loaded(value) {
    		throw new Error("<AnimationScroller>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/App.svelte generated by Svelte v3.46.2 */

    const { window: window_1 } = globals;
    const file = "src/App.svelte";

    // (26:1) { #if loaded && scrollY < 50 }
    function create_if_block(ctx) {
    	let div_1;
    	let img;
    	let img_src_value;
    	let div_1_intro;
    	let div_1_outro;
    	let current;

    	const block = {
    		c: function create() {
    			div_1 = element("div");
    			img = element("img");
    			if (!src_url_equal(img.src, img_src_value = "/assets/arrow.gif")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "class", "svelte-24lus6");
    			add_location(img, file, 27, 3, 833);
    			attr_dev(div_1, "class", "bubble svelte-24lus6");
    			add_location(div_1, file, 26, 2, 716);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div_1, anchor);
    			append_dev(div_1, img);
    			/*div_1_binding*/ ctx[5](div_1);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (div_1_outro) div_1_outro.end(1);
    				div_1_intro = create_in_transition(div_1, fly, { y: 200, duration: 2000 });
    				div_1_intro.start();
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (div_1_intro) div_1_intro.invalidate();
    			div_1_outro = create_out_transition(div_1, fly, { y: 200, duration: 2000 });
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div_1);
    			/*div_1_binding*/ ctx[5](null);
    			if (detaching && div_1_outro) div_1_outro.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(26:1) { #if loaded && scrollY < 50 }",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let scrolling = false;

    	let clear_scrolling = () => {
    		scrolling = false;
    	};

    	let scrolling_timeout;
    	let animationscroller;
    	let updating_loaded;
    	let t;
    	let main;
    	let current;
    	let mounted;
    	let dispose;
    	add_render_callback(/*onwindowscroll*/ ctx[3]);

    	function animationscroller_loaded_binding(value) {
    		/*animationscroller_loaded_binding*/ ctx[4](value);
    	}

    	let animationscroller_props = {};

    	if (/*loaded*/ ctx[0] !== void 0) {
    		animationscroller_props.loaded = /*loaded*/ ctx[0];
    	}

    	animationscroller = new AnimationScroller({
    			props: animationscroller_props,
    			$$inline: true
    		});

    	binding_callbacks.push(() => bind(animationscroller, 'loaded', animationscroller_loaded_binding));
    	let if_block = /*loaded*/ ctx[0] && /*scrollY*/ ctx[2] < 50 && create_if_block(ctx);

    	const block = {
    		c: function create() {
    			create_component(animationscroller.$$.fragment);
    			t = space();
    			main = element("main");
    			if (if_block) if_block.c();
    			attr_dev(main, "class", "svelte-24lus6");
    			add_location(main, file, 24, 0, 675);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(animationscroller, target, anchor);
    			insert_dev(target, t, anchor);
    			insert_dev(target, main, anchor);
    			if (if_block) if_block.m(main, null);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(window_1, "scroll", () => {
    					scrolling = true;
    					clearTimeout(scrolling_timeout);
    					scrolling_timeout = setTimeout(clear_scrolling, 100);
    					/*onwindowscroll*/ ctx[3]();
    				});

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*scrollY*/ 4 && !scrolling) {
    				scrolling = true;
    				clearTimeout(scrolling_timeout);
    				scrollTo(window_1.pageXOffset, /*scrollY*/ ctx[2]);
    				scrolling_timeout = setTimeout(clear_scrolling, 100);
    			}

    			const animationscroller_changes = {};

    			if (!updating_loaded && dirty & /*loaded*/ 1) {
    				updating_loaded = true;
    				animationscroller_changes.loaded = /*loaded*/ ctx[0];
    				add_flush_callback(() => updating_loaded = false);
    			}

    			animationscroller.$set(animationscroller_changes);

    			if (/*loaded*/ ctx[0] && /*scrollY*/ ctx[2] < 50) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*loaded, scrollY*/ 5) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(main, null);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(animationscroller.$$.fragment, local);
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(animationscroller.$$.fragment, local);
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(animationscroller, detaching);
    			if (detaching) detach_dev(t);
    			if (detaching) detach_dev(main);
    			if (if_block) if_block.d();
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('App', slots, []);
    	let loaded;

    	// let showText = true;
    	let div;

    	let scrollY;

    	onMount(() => {
    		window.scroll(0, 0);
    	});

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	function onwindowscroll() {
    		$$invalidate(2, scrollY = window_1.pageYOffset);
    	}

    	function animationscroller_loaded_binding(value) {
    		loaded = value;
    		$$invalidate(0, loaded);
    	}

    	function div_1_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			div = $$value;
    			$$invalidate(1, div);
    		});
    	}

    	$$self.$capture_state = () => ({
    		AnimationScroller,
    		fly,
    		onMount,
    		loaded,
    		div,
    		scrollY
    	});

    	$$self.$inject_state = $$props => {
    		if ('loaded' in $$props) $$invalidate(0, loaded = $$props.loaded);
    		if ('div' in $$props) $$invalidate(1, div = $$props.div);
    		if ('scrollY' in $$props) $$invalidate(2, scrollY = $$props.scrollY);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		loaded,
    		div,
    		scrollY,
    		onwindowscroll,
    		animationscroller_loaded_binding,
    		div_1_binding
    	];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    const app = new App({
        target: document.body,
    });

    return app;

})();
//# sourceMappingURL=bundle.js.map
