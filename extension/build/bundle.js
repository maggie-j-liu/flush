
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var app = (function () {
    'use strict';

    function noop() { }
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
    function append(target, node) {
        target.appendChild(node);
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
    function prevent_default(fn) {
        return function (event) {
            event.preventDefault();
            // @ts-ignore
            return fn.call(this, event);
        };
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
    function set_input_value(input, value) {
        input.value = value == null ? '' : value;
    }
    function set_style(node, key, value, important) {
        if (value === null) {
            node.style.removeProperty(key);
        }
        else {
            node.style.setProperty(key, value, important ? 'important' : '');
        }
    }
    function custom_event(type, detail, bubbles = false) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
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
    const outroing = new Set();
    let outros;
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

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);
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
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.46.4' }, detail), true));
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
    function prop_dev(node, property, value) {
        node[property] = value;
        dispatch_dev('SvelteDOMSetProperty', { node, property, value });
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

    /* src/components/Flashcard.svelte generated by Svelte v3.46.4 */

    const file$1 = "src/components/Flashcard.svelte";

    // (33:4) {#if showCardBack}
    function create_if_block$1(ctx) {
    	let span;
    	let t1;
    	let div;
    	let t2;
    	let p;
    	let t3;

    	const block = {
    		c: function create() {
    			span = element("span");
    			span.textContent = "Correct Answer";
    			t1 = space();
    			div = element("div");
    			t2 = space();
    			p = element("p");
    			t3 = text(/*answer*/ ctx[1]);
    			attr_dev(span, "class", "text-gray-700 text-center");
    			add_location(span, file$1, 33, 6, 1023);
    			attr_dev(div, "class", "w-1/2 border-b-2 border-gray-300 pb-4 mb-4 flex justify-between");
    			add_location(div, file$1, 34, 6, 1091);
    			attr_dev(p, "class", "text-lg text-center text-gray-800 leading-relaxed overflow-y-auto");
    			add_location(p, file$1, 38, 6, 1258);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, div, anchor);
    			insert_dev(target, t2, anchor);
    			insert_dev(target, p, anchor);
    			append_dev(p, t3);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*answer*/ 2) set_data_dev(t3, /*answer*/ ctx[1]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(div);
    			if (detaching) detach_dev(t2);
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(33:4) {#if showCardBack}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let div3;
    	let div1;
    	let span;
    	let t0;
    	let t1;
    	let t2;
    	let div0;
    	let t3;
    	let p;
    	let t4;
    	let div1_class_value;
    	let t5;
    	let div2;
    	let div2_class_value;
    	let if_block = /*showCardBack*/ ctx[0] && create_if_block$1(ctx);

    	const block = {
    		c: function create() {
    			div3 = element("div");
    			div1 = element("div");
    			span = element("span");
    			t0 = text("Question ");
    			t1 = text(/*questionNum*/ ctx[3]);
    			t2 = space();
    			div0 = element("div");
    			t3 = space();
    			p = element("p");
    			t4 = text(/*question*/ ctx[2]);
    			t5 = space();
    			div2 = element("div");
    			if (if_block) if_block.c();
    			attr_dev(span, "class", "text-gray-700 text-center");
    			add_location(span, file$1, 16, 4, 438);
    			attr_dev(div0, "class", "w-1/2 border-b-2 border-gray-300 pb-4 mb-4 flex justify-between");
    			add_location(div0, file$1, 17, 4, 512);
    			attr_dev(p, "class", "text-lg text-center text-gray-800 leading-relaxed overflow-y-auto");
    			add_location(p, file$1, 21, 4, 671);
    			attr_dev(div1, "class", div1_class_value = "" + ((/*showCardBack*/ ctx[0] ? 'front-flip' : 'front') + " card absolute inset-0 flex flex-col items-center justify-center bg-gray-100 mx-auto rounded-xl p-8 aspect-5/3 overflow-y-auto"));
    			add_location(div1, file$1, 11, 2, 235);
    			attr_dev(div2, "class", div2_class_value = "" + ((/*showCardBack*/ ctx[0] ? 'back-flip' : 'back') + " card absolute inset-0 flex flex-col items-center justify-center bg-gray-100 mx-auto rounded-xl p-8 aspect-5/3 overflow-y-auto"));
    			add_location(div2, file$1, 27, 2, 797);
    			attr_dev(div3, "class", "group relative max-w-2xl w-full mx-auto overflow-visible aspect-5/3");
    			set_style(div3, "perspective", "100rem");
    			add_location(div3, file$1, 7, 0, 117);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div3, anchor);
    			append_dev(div3, div1);
    			append_dev(div1, span);
    			append_dev(span, t0);
    			append_dev(span, t1);
    			append_dev(div1, t2);
    			append_dev(div1, div0);
    			append_dev(div1, t3);
    			append_dev(div1, p);
    			append_dev(p, t4);
    			append_dev(div3, t5);
    			append_dev(div3, div2);
    			if (if_block) if_block.m(div2, null);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*questionNum*/ 8) set_data_dev(t1, /*questionNum*/ ctx[3]);
    			if (dirty & /*question*/ 4) set_data_dev(t4, /*question*/ ctx[2]);

    			if (dirty & /*showCardBack*/ 1 && div1_class_value !== (div1_class_value = "" + ((/*showCardBack*/ ctx[0] ? 'front-flip' : 'front') + " card absolute inset-0 flex flex-col items-center justify-center bg-gray-100 mx-auto rounded-xl p-8 aspect-5/3 overflow-y-auto"))) {
    				attr_dev(div1, "class", div1_class_value);
    			}

    			if (/*showCardBack*/ ctx[0]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$1(ctx);
    					if_block.c();
    					if_block.m(div2, null);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			if (dirty & /*showCardBack*/ 1 && div2_class_value !== (div2_class_value = "" + ((/*showCardBack*/ ctx[0] ? 'back-flip' : 'back') + " card absolute inset-0 flex flex-col items-center justify-center bg-gray-100 mx-auto rounded-xl p-8 aspect-5/3 overflow-y-auto"))) {
    				attr_dev(div2, "class", div2_class_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div3);
    			if (if_block) if_block.d();
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

    function instance$1($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Flashcard', slots, []);
    	let { showCardBack } = $$props;
    	let { answer } = $$props;
    	let { question } = $$props;
    	let { questionNum } = $$props;
    	const writable_props = ['showCardBack', 'answer', 'question', 'questionNum'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Flashcard> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('showCardBack' in $$props) $$invalidate(0, showCardBack = $$props.showCardBack);
    		if ('answer' in $$props) $$invalidate(1, answer = $$props.answer);
    		if ('question' in $$props) $$invalidate(2, question = $$props.question);
    		if ('questionNum' in $$props) $$invalidate(3, questionNum = $$props.questionNum);
    	};

    	$$self.$capture_state = () => ({
    		showCardBack,
    		answer,
    		question,
    		questionNum
    	});

    	$$self.$inject_state = $$props => {
    		if ('showCardBack' in $$props) $$invalidate(0, showCardBack = $$props.showCardBack);
    		if ('answer' in $$props) $$invalidate(1, answer = $$props.answer);
    		if ('question' in $$props) $$invalidate(2, question = $$props.question);
    		if ('questionNum' in $$props) $$invalidate(3, questionNum = $$props.questionNum);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [showCardBack, answer, question, questionNum];
    }

    class Flashcard extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {
    			showCardBack: 0,
    			answer: 1,
    			question: 2,
    			questionNum: 3
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Flashcard",
    			options,
    			id: create_fragment$1.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*showCardBack*/ ctx[0] === undefined && !('showCardBack' in props)) {
    			console.warn("<Flashcard> was created without expected prop 'showCardBack'");
    		}

    		if (/*answer*/ ctx[1] === undefined && !('answer' in props)) {
    			console.warn("<Flashcard> was created without expected prop 'answer'");
    		}

    		if (/*question*/ ctx[2] === undefined && !('question' in props)) {
    			console.warn("<Flashcard> was created without expected prop 'question'");
    		}

    		if (/*questionNum*/ ctx[3] === undefined && !('questionNum' in props)) {
    			console.warn("<Flashcard> was created without expected prop 'questionNum'");
    		}
    	}

    	get showCardBack() {
    		throw new Error("<Flashcard>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set showCardBack(value) {
    		throw new Error("<Flashcard>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get answer() {
    		throw new Error("<Flashcard>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set answer(value) {
    		throw new Error("<Flashcard>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get question() {
    		throw new Error("<Flashcard>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set question(value) {
    		throw new Error("<Flashcard>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get questionNum() {
    		throw new Error("<Flashcard>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set questionNum(value) {
    		throw new Error("<Flashcard>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    const flashCards = [
      {
        question: "What's the name of this hackathon?",
        answer: "blueprint",
      },
      {
        question: "Where does this hackathon take place?",
        answer: "online",
      },
      {
        question: "Is this hackathon open to middle school students?",
        answer: "no",
      },
      {
        question: "How many web development tracks are there in the learnathon?",
        answer: "two",
      },
    ];

    /* src/App.svelte generated by Svelte v3.46.4 */

    const { console: console_1 } = globals;
    const file = "src/App.svelte";

    // (92:4) {#if answered}
    function create_if_block_1(ctx) {
    	let if_block_anchor;

    	function select_block_type(ctx, dirty) {
    		if (/*correct*/ ctx[1]) return create_if_block_2;
    		return create_else_block;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			}
    		},
    		d: function destroy(detaching) {
    			if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(92:4) {#if answered}",
    		ctx
    	});

    	return block;
    }

    // (95:6) {:else}
    function create_else_block(ctx) {
    	let p;

    	const block = {
    		c: function create() {
    			p = element("p");
    			p.textContent = "that was incorrect, try again :(";
    			attr_dev(p, "class", "text-red-500");
    			add_location(p, file, 95, 8, 3128);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(95:6) {:else}",
    		ctx
    	});

    	return block;
    }

    // (93:6) {#if correct}
    function create_if_block_2(ctx) {
    	let p;

    	const block = {
    		c: function create() {
    			p = element("p");
    			p.textContent = `that was correct! redirecting to ${/*site*/ ctx[9]}`;
    			attr_dev(p, "class", "text-green-500");
    			add_location(p, file, 93, 8, 3036);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(93:6) {#if correct}",
    		ctx
    	});

    	return block;
    }

    // (103:2) {#if answered && !correct}
    function create_if_block(ctx) {
    	let button;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "next →";
    			add_location(button, file, 103, 4, 3406);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", prevent_default(/*click_handler*/ ctx[13]), false, true, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(103:2) {#if answered && !correct}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let main;
    	let h1;
    	let t1;
    	let p0;
    	let t2;
    	let span0;
    	let t4;
    	let img;
    	let img_src_value;
    	let t5;
    	let p1;
    	let t7;
    	let div0;
    	let label;
    	let span1;
    	let t9;
    	let input;
    	let input_class_value;
    	let t10;
    	let button;
    	let t11;
    	let button_disabled_value;
    	let t12;
    	let div1;
    	let t13;
    	let div2;
    	let flashcard;
    	let t14;
    	let current;
    	let mounted;
    	let dispose;
    	let if_block0 = /*answered*/ ctx[2] && create_if_block_1(ctx);

    	flashcard = new Flashcard({
    			props: {
    				question: /*question*/ ctx[7],
    				answer: /*correctAnswer*/ ctx[8],
    				showCardBack: /*showCardBack*/ ctx[5],
    				questionNum: /*questionNum*/ ctx[3]
    			},
    			$$inline: true
    		});

    	let if_block1 = /*answered*/ ctx[2] && !/*correct*/ ctx[1] && create_if_block(ctx);

    	const block = {
    		c: function create() {
    			main = element("main");
    			h1 = element("h1");
    			h1.textContent = "Flush.";
    			t1 = space();
    			p0 = element("p");
    			t2 = text("you have been blocked from ");
    			span0 = element("span");
    			span0.textContent = `${/*site*/ ctx[9] ? /*site*/ ctx[9] : "this page"}`;
    			t4 = space();
    			img = element("img");
    			t5 = space();
    			p1 = element("p");
    			p1.textContent = "Answer the flashcard below to gain access:";
    			t7 = space();
    			div0 = element("div");
    			label = element("label");
    			span1 = element("span");
    			span1.textContent = "Answer:";
    			t9 = space();
    			input = element("input");
    			t10 = space();
    			button = element("button");
    			t11 = text("Submit");
    			t12 = space();
    			div1 = element("div");
    			if (if_block0) if_block0.c();
    			t13 = space();
    			div2 = element("div");
    			create_component(flashcard.$$.fragment);
    			t14 = space();
    			if (if_block1) if_block1.c();
    			attr_dev(h1, "class", "text-5xl font-bold text-center bg-gradient-to-r from-pink-400 to-yellow-500 w-max mx-auto text-transparent bg-clip-text");
    			add_location(h1, file, 51, 2, 1497);
    			attr_dev(span0, "class", "font-normal");
    			add_location(span0, file, 57, 31, 1751);
    			attr_dev(img, "class", "w-5 h-5 inline");
    			if (!src_url_equal(img.src, img_src_value = "https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/160/twitter/53/flushed-face_1f633.png")) attr_dev(img, "src", img_src_value);
    			add_location(img, file, 60, 4, 1828);
    			attr_dev(p0, "class", "text-xl text-center mt-1 font-light text-gray-600");
    			add_location(p0, file, 56, 2, 1658);
    			attr_dev(p1, "class", "text-xl text-center");
    			add_location(p1, file, 65, 2, 1994);
    			attr_dev(span1, "class", "text-gray-600 align-baseline");
    			add_location(span1, file, 70, 6, 2204);

    			attr_dev(input, "class", input_class_value = "" + ((/*answered*/ ctx[2]
    			? `${/*correct*/ ctx[1] ? 'text-green-600' : 'text-red-500'}`
    			: '') + " bg-transparent border-0 border-b-2 " + (/*answered*/ ctx[2]
    			? `${/*correct*/ ctx[1]
				? 'border-green-600'
				: 'border-red-500'}`
    			: 'border-gray-400') + " focus:outline-none focus:ring-0 focus:border-pink-400"));

    			attr_dev(input, "type", "text");
    			input.disabled = /*answered*/ ctx[2];
    			add_location(input, file, 71, 6, 2269);
    			add_location(label, file, 69, 4, 2190);
    			attr_dev(button, "class", "ml-4 bg-pink-400 text-white font-medium text-lg px-3 py-0.5 rounded disabled:cursor-not-allowed disabled:opacity-70");
    			attr_dev(button, "type", "button");
    			button.disabled = button_disabled_value = /*answered*/ ctx[2] || !/*inputAnswer*/ ctx[0].length;
    			add_location(button, file, 82, 4, 2682);
    			attr_dev(div0, "class", "mt-8 text-xl flex items-end bg-gradient-to-r from-pink-200 to-yellow-100 px-4 py-2 rounded");
    			add_location(div0, file, 66, 2, 2074);
    			attr_dev(div1, "class", "h-4 mt-2");
    			add_location(div1, file, 90, 2, 2966);
    			attr_dev(div2, "class", "container mx-auto flex items-center my-8 h-fit");
    			add_location(div2, file, 99, 2, 3222);
    			attr_dev(main, "class", "text-base px-16 py-20 flex flex-col items-center");
    			add_location(main, file, 50, 0, 1431);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, h1);
    			append_dev(main, t1);
    			append_dev(main, p0);
    			append_dev(p0, t2);
    			append_dev(p0, span0);
    			append_dev(p0, t4);
    			append_dev(p0, img);
    			append_dev(main, t5);
    			append_dev(main, p1);
    			append_dev(main, t7);
    			append_dev(main, div0);
    			append_dev(div0, label);
    			append_dev(label, span1);
    			append_dev(label, t9);
    			append_dev(label, input);
    			set_input_value(input, /*inputAnswer*/ ctx[0]);
    			append_dev(div0, t10);
    			append_dev(div0, button);
    			append_dev(button, t11);
    			append_dev(main, t12);
    			append_dev(main, div1);
    			if (if_block0) if_block0.m(div1, null);
    			append_dev(main, t13);
    			append_dev(main, div2);
    			mount_component(flashcard, div2, null);
    			append_dev(main, t14);
    			if (if_block1) if_block1.m(main, null);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(input, "input", /*input_input_handler*/ ctx[12]),
    					listen_dev(button, "click", prevent_default(/*checkAnswer*/ ctx[11]), false, true, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (!current || dirty & /*answered, correct*/ 6 && input_class_value !== (input_class_value = "" + ((/*answered*/ ctx[2]
    			? `${/*correct*/ ctx[1] ? 'text-green-600' : 'text-red-500'}`
    			: '') + " bg-transparent border-0 border-b-2 " + (/*answered*/ ctx[2]
    			? `${/*correct*/ ctx[1]
				? 'border-green-600'
				: 'border-red-500'}`
    			: 'border-gray-400') + " focus:outline-none focus:ring-0 focus:border-pink-400"))) {
    				attr_dev(input, "class", input_class_value);
    			}

    			if (!current || dirty & /*answered*/ 4) {
    				prop_dev(input, "disabled", /*answered*/ ctx[2]);
    			}

    			if (dirty & /*inputAnswer*/ 1 && input.value !== /*inputAnswer*/ ctx[0]) {
    				set_input_value(input, /*inputAnswer*/ ctx[0]);
    			}

    			if (!current || dirty & /*answered, inputAnswer*/ 5 && button_disabled_value !== (button_disabled_value = /*answered*/ ctx[2] || !/*inputAnswer*/ ctx[0].length)) {
    				prop_dev(button, "disabled", button_disabled_value);
    			}

    			if (/*answered*/ ctx[2]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_1(ctx);
    					if_block0.c();
    					if_block0.m(div1, null);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			const flashcard_changes = {};
    			if (dirty & /*question*/ 128) flashcard_changes.question = /*question*/ ctx[7];
    			if (dirty & /*correctAnswer*/ 256) flashcard_changes.answer = /*correctAnswer*/ ctx[8];
    			if (dirty & /*showCardBack*/ 32) flashcard_changes.showCardBack = /*showCardBack*/ ctx[5];
    			if (dirty & /*questionNum*/ 8) flashcard_changes.questionNum = /*questionNum*/ ctx[3];
    			flashcard.$set(flashcard_changes);

    			if (/*answered*/ ctx[2] && !/*correct*/ ctx[1]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block(ctx);
    					if_block1.c();
    					if_block1.m(main, null);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(flashcard.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(flashcard.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			if (if_block0) if_block0.d();
    			destroy_component(flashcard);
    			if (if_block1) if_block1.d();
    			mounted = false;
    			run_all(dispose);
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
    	console.log(window.location);
    	const urlParams = new URLSearchParams(window.location.search);
    	const site = urlParams.get("site");
    	let inputAnswer = "";
    	let correct = false;
    	let answered = false;
    	let questionNum = 1;
    	let availableCards = JSON.parse(JSON.stringify(flashCards));

    	const getRandomIndex = () => {
    		return Math.floor(Math.random() * availableCards.length);
    	};

    	let showCardBack = false;
    	let flashcardIndex = getRandomIndex();
    	console.log(availableCards);

    	// add to the above index if the user correctly answers the question
    	let question = availableCards[flashcardIndex].question;

    	let correctAnswer = availableCards[flashcardIndex].answer;

    	// flip if the answer is wrong in the checkanswer v
    	const checkAnswer = () => {
    		if (inputAnswer.toLowerCase() === correctAnswer.toLowerCase()) {
    			$$invalidate(1, correct = true);
    			const laterDate = Date.now() + 60 * 1000 * 1;

    			if (chrome.storage) {
    				const origin = new URL(site).origin;

    				chrome.storage.local.set({ [origin]: laterDate }, () => {
    					setTimeout(
    						() => {
    							window.location.href = site;
    						},
    						3000
    					);
    				});
    			}
    		} else {
    			$$invalidate(5, showCardBack = true);
    		}

    		$$invalidate(2, answered = true);
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	function input_input_handler() {
    		inputAnswer = this.value;
    		$$invalidate(0, inputAnswer);
    	}

    	const click_handler = () => {
    		$$invalidate(2, answered = false);
    		$$invalidate(0, inputAnswer = "");
    		$$invalidate(1, correct = false);
    		$$invalidate(5, showCardBack = false);
    		availableCards.splice(flashcardIndex, 1);

    		if (availableCards.length === 0) {
    			console.log("no more cards");
    			$$invalidate(4, availableCards = flashCards);
    		}

    		$$invalidate(6, flashcardIndex = getRandomIndex());
    		console.log(availableCards, flashcardIndex);
    		$$invalidate(7, question = availableCards[flashcardIndex].question);
    		$$invalidate(8, correctAnswer = availableCards[flashcardIndex].answer);
    		$$invalidate(3, questionNum++, questionNum);
    	};

    	$$self.$capture_state = () => ({
    		Flashcard,
    		flashCards,
    		urlParams,
    		site,
    		inputAnswer,
    		correct,
    		answered,
    		questionNum,
    		availableCards,
    		getRandomIndex,
    		showCardBack,
    		flashcardIndex,
    		question,
    		correctAnswer,
    		checkAnswer
    	});

    	$$self.$inject_state = $$props => {
    		if ('inputAnswer' in $$props) $$invalidate(0, inputAnswer = $$props.inputAnswer);
    		if ('correct' in $$props) $$invalidate(1, correct = $$props.correct);
    		if ('answered' in $$props) $$invalidate(2, answered = $$props.answered);
    		if ('questionNum' in $$props) $$invalidate(3, questionNum = $$props.questionNum);
    		if ('availableCards' in $$props) $$invalidate(4, availableCards = $$props.availableCards);
    		if ('showCardBack' in $$props) $$invalidate(5, showCardBack = $$props.showCardBack);
    		if ('flashcardIndex' in $$props) $$invalidate(6, flashcardIndex = $$props.flashcardIndex);
    		if ('question' in $$props) $$invalidate(7, question = $$props.question);
    		if ('correctAnswer' in $$props) $$invalidate(8, correctAnswer = $$props.correctAnswer);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		inputAnswer,
    		correct,
    		answered,
    		questionNum,
    		availableCards,
    		showCardBack,
    		flashcardIndex,
    		question,
    		correctAnswer,
    		site,
    		getRandomIndex,
    		checkAnswer,
    		input_input_handler,
    		click_handler
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
