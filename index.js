/**
 * @fileOverview 图片懒加载
 * @author 俞天麟
 */

~function (window) {
    var $ = window.$;
    var init = false;
    var noop = function () {
    };
    var _imageCache, $box, H, WIN, cur, all;

    var error = {
        noDollar: 'LazyLoad依赖jQuery或zepto，将其赋给window.$或者通过#config传入，具体可参阅文档 https://www.zybuluo.com/TyrionYu/note/318664'
    };

    var isMobile = (/(nokia|iphone|android|ipad|motorola|^mot\-|softbank|foma|docomo|kddi|up\.browser|up\.link|htc|dopod|blazer|netfront|helio|hosin|huawei|novarra|CoolPad|webos|techfaith|palmsource|blackberry|alcatel|amoi|ktouch|nexian|samsung|^sam\-|s[cg]h|^lge|ericsson|philips|sagem|wellcom|bunjalloo|maui|symbian|smartphone|midp|wap|phone|windows ce|iemobile|^spice|^bird|^zte\-|longcos|pantech|gionee|^sie\-|portalmmm|jig\s browser|hiptop|^ucweb|^benq|haier|^lct|opera\s*mobi|opera\*mini|320x320|240x320|176x220)/i).test(navigator.userAgent);

    // 默认配置
    var _config = {
        tag: 'data-src',
        offset: 0,
        duration: isMobile ? 200 : 600,
        loading: noop,
        complete: noop
    };

    function _init() {
        if (typeof $ === 'undefined') {
            throw new Error(error.noDollar);
        }

        _addStylesheetRules([
            [
                'img.LazyLoad',
                ['-webkit-transition', 'opacity ' + _config.duration / 1000 + 's ease'],
                ['transition', 'opacity ' + _config.duration / 1000 + 's ease'],
                ['opacity', '0']
            ],
            [
                'img.LazyLoad.loaded',
                ['opacity', '1']
            ]
        ]);

        WIN = $(window);
        H = WIN.height();

        WIN.on('resize', function () {
            H = WIN.height();
        });

        init = true;
    }

    function _changeDuration() {
        if (_config.duration < 0) return;

        _addStylesheetRules([
            [
                'img.LazyLoad',
                ['-webkit-transition-duration', _config.duration / 1000 + 's'],
                ['transition-duration', _config.duration / 1000 + 's']
            ]
        ]);
    }

    function _addStylesheetRules(decls) {
        var style = document.createElement('style');

        document.getElementsByTagName('head')[0].appendChild(style);

        if (!window.createPopup) { /* For Safari */
            style.appendChild(document.createTextNode(''));
        }

        var s = document.styleSheets[document.styleSheets.length - 1];

        for (var i = 0, dl = decls.length; i < dl; i++) {
            var j = 1, decl = decls[i], selector = decl[0], rulesStr = '';

            if (Object.prototype.toString.call(decl[1][0]) === '[object Array]') {
                decl = decl[1];
                j = 0;
            }

            for (var rl = decl.length; j < rl; j++) {
                var rule = decl[j];
                rulesStr += rule[0] + ':' + rule[1] + (rule[2] ? ' !important' : '') + ';\n';
            }

            if (s.insertRule) {
                s.insertRule(selector + '{' + rulesStr + '}', s.cssRules.length);
            } else { /* IE */
                s.addRule(selector, rulesStr, -1);
            }
        }
    }

    function config(opts) {
        if (opts.dollar) {
            $ = opts.dollar;
        }

        if (typeof $ === 'undefined') {
            throw new Error(error.noDollar);
        }

        if (opts.loading && typeof opts.loading !== 'function') {
            throw new Error('loading的类型必须是个函数或者null');
        } else if (opts.loading === null) {
            opts.loading = noop;
        }

        if (opts.complete && typeof opts.complete !== 'function') {
            throw new Error('complete的类型必须是个函数或者null');
        } else if (opts.complete === null) {
            opts.complete = noop;
        }

        $.extend(_config, opts);

        if (typeof opts.duration === 'number') {
            _changeDuration();
        }
    }

    function load(selector) {
        if (!init) {
            $ = $ || window.$;
            _init();
        }

        _imageCache = [];
        WIN.off('scroll', _detect);

        if (selector) {
            $box = typeof selector === 'string' ? $(selector) : selector;
        } else {
            $box = $box || $('body');
        }

        var $images = $box.find('img');

        if ($images.length) {
            $images.each(function () {
                if ($(this).attr(_config.tag)) {
                    if (_config.duration >= 0) {
                        $(this).addClass('LazyLoad');
                    }
                    _imageCache.push(this);
                }
            });

            cur = 0;
            all = _imageCache.length;

            _detect();
            WIN.on('scroll', _detect);
        }
    }

    function stop() {
        _imageCache = [];
    }

    function _detectImageInScreen() {
        var length = _imageCache.length;

        if (!length) {
            WIN.off('scroll', _detect);
            return;
        }

        for (var j = length; j--;) {
            var image = _imageCache[j];
            var rect = image.getBoundingClientRect();

            if (_config.offset < 0 || rect.top < 0 && rect.bottom > 0 ||
                rect.top >= 0 && rect.top < (H + _config.offset)) {
                $(image).on('load', function () {
                    $(this).addClass('loaded');
                    _config.loading(Math.floor(++cur * 100 / all));
                    if (cur == all) _config.complete();
                });
                image.src = image.getAttribute(_config.tag);
                image.removeAttribute(_config.tag);
                _imageCache.splice(j, 1);
            }
        }
    }

    function _setFrequency(fn, time) {
        var timer = 0;
        return function () {
            if (timer) return;
            timer = setTimeout(function () {
                clearTimeout(timer);
                timer = 0;
                fn();
            }, time)
        }
    }

    var _detect = _setFrequency(_detectImageInScreen, 120);

    var LazyLoad = {
        config: config,
        load: load,
        stop: stop
    };

    umd('LazyLoad', LazyLoad);

    function umd(modName, mod) {
        switch (true) {
            case typeof module === 'object' && !!module.exports:
                module.exports = mod;
                break;
            case typeof define === 'function' && !!define.amd:
                define(modName, function () {
                    return mod;
                });
                break;
            default:
                try { /* Fuck IE8- */
                    if (typeof execScript === 'object') execScript('var ' + modName);
                } catch (error) {
                }
                window[modName] = mod;
        }
    }
}(window);
