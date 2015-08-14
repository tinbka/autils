/**
 * @license autils v1.0.0
 * (c) Sergey Baev, https://github.com/tinbka
 * License: MIT
 *
 * Rubyish enumerable methods for JS Objects and Arrays.
 * A plenty of analogues of Ruby language enumerable object functions are defined here to help a rubyist to program JavaScript.
 */
$au = {

  /* ENUMERABLIFY */
  array: function(obj) {
    if (jQuery.isArray(obj)) return obj;
    if (typeof obj == 'string') return obj.split(' ');
    var ary = [];
    for (var i=0; i<obj.length; i++) ary.push(obj[i]);
    if (!ary.length) for (var i in obj) ary.push([i, obj[i]]);
    return ary;
  },
  
  object: function(obj) {
    if (jQuery.isPlainObject(obj)) return obj;
    var hash = {};
    if (jQuery.isArray(obj)) {
      if (!obj.length) 
        return hash;
      if (jQuery.isArray(obj[0]) && obj[0].length == 2) {
        $au.each(obj, function(i) {hash[i[0]] = i[1]});
        return hash;
      }
    }
    if (typeof obj == 'string') { // url params
      $au.each(obj.split('&'), function(frag) {
        if (frag) {
          var v = frag.split('='); 
          hash[v[0]] = decodeURIComponent(v[1]);
        }
      });
    } else if (obj)
      for (var k in obj) 
        hash[k] = obj[k];
    return hash;
  },
  
  uri: function(obj) {
    if (obj instanceof jQuery)
      obj = obj[0];
    if (obj instanceof Element)
      obj = obj.href;
    if (!obj)
      return {};
    var hash = {href: obj};
    var protocol_and_other = obj.split('://');
    hash.protocol = protocol_and_other[0];
    var host_and_other = protocol_and_other[1].split('/');
    hash.host = host_and_other[0];
    var fullpath_and_hash = ('/'+host_and_other.slice(1).join('/')).split('#');
    hash.fullpath = fullpath_and_hash[0], hash.hash = fullpath_and_hash[1];
    var path_and_query = hash.fullpath.split('?');
    hash.path = path_and_query[0], hash.query_string = path_and_query[1];
    hash.query = $au.object(hash.query_string);
    return hash;
  },
  
  
  
  /* BASIC ITERATORS */
  each: function(obj, fun) {  
    //var ary = $au.array(obj);
    if (jQuery.isPlainObject(obj)) {
      for (var k in obj) if (fun(k, obj[k]) === true) break;
    } else {
      for (var i=0; i<obj.length; i++) if (fun(obj[i]) === true) break;
    }
  },
  
  reverse_each: function(obj, fun) {  
    //var ary = $au.array(obj);
    for (var i=obj.length-1; i>=0; i--) if (fun(obj[i]) === true) break;
  },
  
  each_with_index: function(obj, fun) {  
    //var ary = $au.array(obj);
    for (var i=0; i<obj.length; i++) if (fun(obj[i], i) === true) break;
  },
  
  
  
  /* HASH <-> ARRAY */
  keys: function(obj) {
    if (jQuery.isArray(obj)) return obj;
    var ary = [];
    for (var k in obj) ary.push(k);
    return ary;
  },
  
  values: function(obj) {
    if (jQuery.isArray(obj)) return obj;
    var ary = [];
    for (var k in obj) ary.push(obj[k]);
    return ary;
  },
  
  hash: function(obj) {
    if (jQuery.isPlainObject(obj)) return obj;
    var h = {}, k;
    $au.each(obj, function(i) {if (k !== undefined) {h[k] = i; k = undefined} else k = i});
    return h;
  },
  
  
  
  /* FIND FIRST ITERATORS */
  find: function(obj, fun) {
    var res;
    if (jQuery.isPlainObject(obj)) 
      $au.each(obj, function(k, v) {if (fun(k, v)) {res = v; return true}});
    else 
      $au.each(obj, function(i) {if (fun(i)) {res = i; return true}});
    return res;
  },
  
  find$: function(obj, fun) {
    var res;
    if (jQuery.isPlainObject(obj)) 
      $au.each(jQuery(obj), function(k, v) {if (fun(k, jQuery(v))) {res = v; return true}});
    else
      $au.each(jQuery(obj), function(i) {i = jQuery(i); if (fun(i)) {res = i; return true}});
    return res;
  },
  
  rfind: function(obj, fun) {
    var res;
    $au.reverse_each(obj, function(i) {if (fun(i)) {res = i; return true}});
    return res;
  },
  
  rfind$: function(obj, fun) {
    var res;
    $au.reverse_each(jQuery(obj), function(i) {i = jQuery(i); if (fun(i)) {res = i; return true}});
    return res;
  },
  
  in_: function(obj, ary) {
    return this.find(ary, function(i) {return i === obj}) !== undefined;
  },
  
  last: function(obj, fun) {
    if (fun)
      return $au.rfind(obj, fun);
    else
      return obj[obj.length-1];
  },
  
  index_where: function(obj, fun) {
    var res;
    $au.each_with_index(obj, function(e, i) {
      if (fun(e)) {
        res = i; return true;
      }
    });
    return res;
  },
  
  
  
  /* SELECT-REJECT */
  compact: function(obj) {
    if (jQuery.isPlainObject(obj))
      return $au.select(obj, function(k, v) {return v != null});
    else
      return $au.select(obj, function(i) {return i != null});
  },
  
  select: function(obj, fun) {
    switch(true) {
      case jQuery.isArray(obj):
      case obj instanceof jQuery:
        var ary = [];
        this.each(obj, function(i) {if (fun(i)) ary.push(i)});
        return ary;
      case jQuery.isPlainObject(obj): 
        var hash = {};
        for (k in obj) {if (fun(k, obj[k])) hash[k] = obj[k]};
        return hash;
      case typeof obj == 'string':
        return $au.select(obj.split(' '), fun);
    }
  },
  
  select$: function(obj, fun) {
    var ary = [];
    $au.each(this.map(jQuery(obj), jQuery), function(i) {if (fun(i)) ary.push(i)});
    return ary;
  },
  
  reject: function(obj, fun) {
    if (jQuery.isPlainObject(obj))
      return $au.select(obj, function(k, v) {return !fun(k, v)});
    else
      return $au.select(obj, function(i) {return !fun(i)});
  },
  
  reject$: function(obj, fun) {
    var ary = [];
    $au.each(this.map(jQuery(obj), jQuery), function(i) {if (!fun(i)) ary.push(i)});
    return ary;
  },
  
  slice: function(obj, keys, deft) {
    var hash = {};
    if (typeof keys == 'string') keys = keys.split(' ');
    $au.each(keys, function(k) {
      if (k in obj) hash[k] = obj[k];
      else if (typeof deft != 'undefined') hash[k] = deft;
    });
    return hash;
  },
  
  extract: function(obj, keys, deft) {
    if (typeof keys == 'string') keys = keys.split(' ');
    var hash = $au.slice(obj, keys, deft);
    $au.each(keys, function(k) {delete obj[k]});
    return hash;
  },
  
  
  
  /* SET OPS */
  diff: function(obj1, obj2) {
    var is = $au.intersection(obj1, obj2);
    return [$au.exclusion(obj1, is), $au.exclusion(obj2, is)];
  },
  
  obj_diff: function(obj1, obj2) {
    var is = $au.obj_intersection(obj1, obj2);
    return [$au.obj_exclusion(obj1, is), $au.obj_exclusion(obj2, is)];
  },
  
  obj_intersection: function(obj1, obj2) {
    return $au.select(obj1, function(i) {return $au.find(obj2, function(j) {return i === j})});
  },
  
  intersection: function(obj1, obj2) {
    var hash = {}, ary = [];
    $au.each(obj1, function(i) {hash[i] = true});
    $au.each(obj2, function(i) {if (hash[i]) {ary.push(i)}});
    return ary;
  },
  
  intersection_by: function(obj1, obj2, fun) {
    var hash = {}, res_hash = {}, ary = [], res;
    $au.each(obj1, function(i) {if (!hash[i]) {res_hash[fun(i)] = hash[i] = true}});
    hash = {};
    this.each(obj2, function(i) {
      if (hash[i]) ary.push(i); 
      else {
        res = fun(i);
        if (res_hash[res]) {res_hash[res] = hash[i] = true; ary.push(i)}
      }
    });
    return ary;
  },
  
  obj_exclusion: function(obj1, obj2) {
    return $au.reject(obj1, function(i) {return $au.find(obj2, function(j) {return i === j})});
  },
  
  exclusion: function(obj1, obj2) {
    var hash = {}, ary = [];
    $au.each(obj2, function(i) {hash[i] = true});
    $au.each(obj1, function(i) {if (!hash[i]) ary.push(i)});
    return ary;
  },
  
  exclusion_by: function(obj1, obj2, fun) {
    var hash = {}, res_hash = {}, ary = [], res;
    this.each(obj1, function(i) {if (!hash[i]) {hash[i] = true; res_hash[fun(i)] = true}});
    hash = {};
    this.each(obj2, function(i) {
      if (hash[i]) return; 
      res = fun(i);
      if (res_hash[res]) return;
      res_hash[res] = hash[i] = true;
      ary.push(i);
    });
    return ary;
  },
  
  // only for strings/numbers arrays and jQuery (using jQuery's function)
  uniq: function(obj) {
    if (obj[0] instanceof jQuery) return jQuery.uniq(obj);
    var hash = {}, ary = [];
    $au.each(obj, function(i) {if (!hash[i]) {ary.push(i); hash[i] = true}});
    return ary;
  },
  
  // implying that callback is +clean function+ and returns a string or number
  // +fun+ must return string/number
  uniq_by: function(obj, fun) {
    var hash = {}, res_hash = {}, ary = [], res;
    if (typeof fun == 'string') {
      var field = fun;
      fun = function(i) {return i[field]()};
    }
    $au.each(obj, function(i) {
      if ((typeof i == 'number' || typeof i == 'string') && hash[i]) return;
      res = fun(i);
      if (res_hash[res]) return;
      ary.push(i);
      res_hash[res] = true;
      if (typeof i == 'number' || typeof i == 'string')
        hash[i] = true;
    });
    return ary;
  },
  
  merge: function(obj1, obj2) {
    if (jQuery.isPlainObject(obj1)) {
      var hash = {};
      for (var k in obj1) hash[k] = obj1[k];
      if (obj2)
        for (var k in obj2) hash[k] = obj2[k];
      return hash;
    } 
    else if (obj1) {
      return $au.uniq(obj1.concat(obj2 || []));
    }
  },
  
  
  
  /* MAP-REDUCE */
  map: function(obj, fun) {
    var ary = [];
    if (typeof fun == 'string') {
      if (jQuery.isPlainObject(obj)) 
        $au.each(obj, function(k, v) {
          m = v[fun]; if (typeof m == 'function') m = m.apply(v);
          ary.push([k, m]);
        });
      else 
        $au.each(obj, function(i) {
          m = i[fun]; if (typeof m == 'function') m = m.apply(i);
          ary.push(m);
        });
    } else {
      if (jQuery.isPlainObject(obj)) 
        $au.each(obj, function(k, v) {ary.push(fun(k, v))});
      else 
        $au.each(obj, function(i) {ary.push(fun(i))});
    }
    return ary;
  },
  
  map$: function(obj, fun) {
    var ary = [];
    if (typeof fun == 'string') {
      if (jQuery.isPlainObject(obj)) 
        $au.each(obj, function(k, v) {
          v = jQuery(v);
          var m = v[fun]; if (typeof m == 'function') m = m.apply(v);
          ary.push([k, m]);
        });
      else 
        $au.each(jQuery(obj), function(i) {
          i = jQuery(i);
          var m = i[fun]; if (typeof m == 'function') m = m.apply(i);
          ary.push(m);
        });
    } else {
      if (jQuery.isPlainObject(obj)) 
        $au.each(obj, function(k, v) {ary.push(fun(k, jQuery(v)))});
      else 
        $au.each(jQuery(obj), function(i) {ary.push(fun(jQuery(i)))});
    }
    return ary;
  },
  
  map_object: function(obj, fun) {
    var hash = {};
    if (typeof fun == 'string') {
      if (jQuery.isPlainObject(obj)) 
        $au.each(obj, function(k, v) {
          m = v[fun]; if (typeof m == 'function') m = m.apply(v);
          hash[k] = m;
        });
      else 
        $au.each(obj, function(i) {
          m = i[fun]; if (typeof m == 'function') m = m.apply(i);
          hash[m[0]] = m[1];
        });
    } else {
      if (jQuery.isPlainObject(obj)) 
        $au.each(obj, function(k, v) {
          v = fun(k, v);
          hash[v[0]] = v[1];
        });
      else 
        $au.each(obj, function(i) {
          v = fun(i); hash[v[0]] = v[1];
        });
    }
    return hash;
  },
  
  map_with_index: function(obj, fun) {
    var ary = [];
    $au.each_with_index(obj, function(e, i) {ary.push(fun(e, i))});
    return ary;
  },
  
  reduce: function(obj, m, fun) {
    if (!fun) {fun = m; m = obj[0]; obj = obj.slice(1)}
    if (typeof fun == 'string')
      $au.each(obj, function(i) {m = m[fun](i)});
    else
      $au.each(obj, function(i) {m = fun(m, i)});
    return m;
  }, 
  
  foldr: function(obj, m, fun) {
    if (!fun) {fun = m; m = obj[0]; obj = obj.slice(1)}
    if (typeof fun == 'string')
      $au.each(obj.reverse(), function(i) {m = i[fun](m)});
    else
      $au.each(obj.reverse(), function(i) {m = fun(i, m)});
    return m;
  },
  
  
  min: function(obj) {
    return $au.reduce(obj, function(m, i) {return i < m ? i : m});
  },
  
  max: function(obj) {
    return $au.reduce(obj, function(m, i) {return i > m ? i : m});
  },
  
  sum: function(obj, fun, d) {
    if (fun && typeof fun != 'function') d = fun, fun = undefined;
    if (typeof d == 'undefined') d = []; // default, 
    if (!obj.length) return d;
    // we sum arrays only
    if (obj instanceof jQuery) obj = obj.toArray();
    var f;
    if (fun) {
      obj = [fun(obj[0])].concat(obj.slice(1));
      if (jQuery.isArray(obj[0]))
        f = function(m, i) {return m.concat(fun(i))};
      else if (jQuery.isPlainObject(obj[0]))
        f = function(m, i) {return $au.merge(m, fun(i))};
      else if (obj[0] instanceof jQuery)
        f = function(m, i) {return m.add(fun(i))};
      else
        f = function(m, i) {return m+fun(i)};
    } else {
      if (jQuery.isArray(obj[0]))
        f = function(m, i) {return m.concat(i)};
      else if (jQuery.isPlainObject(obj[0]))
        f = function(m, i) {return $au.merge(m, i)};
      else if (obj[0] instanceof jQuery)
        f = function(m, i) {return m.add(i)};
      else
        f = function(m, i) {return m+i};
    }
    return $au.reduce(obj, f);
  },
  
  product: function(obj) {
    return $au.reduce(obj, function(m, i) {return m*i});
  },

  

  /* COMPARE */
  eq: function(obj1, obj2) {
    if ($au.size(obj1) != $au.size(obj2)) return false;
    var eq, i;
    for (i in obj1) {
      switch (typeof obj1[i]) {
        case "object": eq = $au.eq(obj1[i], obj2[i]); break;
        default: eq = (obj1[i] === obj2[i]); break;
      }
      if (!eq) 
        return false;
    }
    return true;
  },
  
  size: function(obj) {
    if (obj instanceof jQuery || jQuery.isArray(obj)) return obj.length;
    var size = 0, key;
    for (key in obj) if (obj.hasOwnProperty(key)) size++;
    return size;
  },
  
  unsafe_sorting: function(x, y) {
    return x < y ? -1 : x > y ? 1 : 0;
  },
  tuple_sorting: function(x, y) {
    for (var i=0; i<x.length; i++) {
      if (x[i] < y[i]) return -1;
      if (x[i] > y[i]) return 1;
    }
    return 0;
  },
  
  // fun must return string or number
  // shouldn't create "sort_object_by", since it's too implicit and fleeting
  sort_by: function(obj, fun) {
    var weights = {}, keys = [], sorted = [];
    $au.each_with_index(obj, function(e, i) {
      var k = fun(e);
      (weights[k] = weights[k] || {})[i] = e; 
      keys.push([k, i])
    });
    $au.each(keys.sort($au.tuple_sorting), function(key) {
      sorted.push(weights[key[0]][key[1]]);
    });
    return sorted;
  },
  
  // fun must return string or number
  min_by: function(obj, fun) {
    return $au.sort_by(obj, fun)[0];
  },
  max_by: function(obj, fun) {
    return $au.sort_by(obj, fun).slice(-1)[0];
  },
  
  sorted_object: function(obj, number_keys) {
    var hash = {}, keys = [];
    if (!jQuery.isPlainObject(obj))
      for (var k in obj) keys.push(k);
    else
      keys = $au.keys(obj);
    if (number_keys) keys = $au.map(keys, parseInt).sort($au.unsafe_sorting);
    else keys = keys.sort();
    $au.each(keys, function(key) {hash[key] = obj[key]});
    return hash;
  },
  
  
  // CAUTION: dangerous for the brain!
  duck_map: function(obj, mapping, defaults) {
    var hash = {};
    $au.each(obj, function(i) {
      $au.each(mapping, function(key, type) {
        if ((typeof type != 'string' && i instanceof type) ||
            ((type == 'dict' || type == 'hash') && jQuery.isPlainObject(i)) ||
            ((type == 'list' || type == 'array') && jQuery.isArray(i)) || 
            (type == 'function' && jQuery.isFunction(i)) || 
            (type == 'string' && typeof i == 'string') || 
            (type == 'number' && typeof i == 'number') || 
            (type == 'boolean' && (typeof i == 'boolean' || i === null))
        ) {
          hash[key] = i;
          delete mapping[key];
          return true;
        }
      })
    });
    $au.each(mapping, function(key, type) {if (type == 'dict' || type == 'hash') hash[key] = {}});
    if (defaults)
      hash = $au.merge(defaults, hash);
    return hash;
  },
  
  
  
  /* STRINGIFY */
  urlencode: function(obj) {
    return $au.map($au.array(obj), function(pair) {return pair[0]+'='+encodeURIComponent(pair[1])}).join('&');
  },
  
  inspect: function(obj, forced_object, recur_forced) {
    if (typeof obj == 'undefined')
      return 'undefined';
    if (obj === null)
      return 'null'
    if (jQuery.isArray(obj))
      return '['+$au.map(obj, function(i) {return $au.inspect(i)}).join(', ')+']';
    if (jQuery.isPlainObject(obj))
      return '{'+$au.map($au.sorted_object(obj), function(k, v) {return k+': '+$au.inspect(v)}).join(', ')+'}';
    if (jQuery.isFunction(obj))
      return '<function>';
    if (jQuery.isWindow(obj))
      return '<window "'+(typeof obj.document == 'undefined'?'':obj.document.name)+'" '+(typeof obj.location == 'undefined'?'':obj.location.pathname)+'>';
    if (typeof obj == 'string')
      return '"'+obj+'"';
    if (typeof obj == 'number')
      return ''+obj;
    if (obj instanceof Element)
      return $au.inspect_node(obj);
    if (forced_object)
      return '{'+$au.map($au.sorted_object(obj), function(k, v) {return k+': '+$au.inspect(v, recur_forced, recur_forced)}).join(', ')+'}';
    if (obj instanceof jQuery)
      return $au.inspect(obj.toArray());
    return obj.toString();
  },
  
  // @ opts : {path, text, html}
  inspect_node: function(obj, opts) {
    if (!obj) return 'null'
    opts = opts || {};
    var jobj = jQuery(obj), objval = obj.value || jobj.attr('value');
    obj = jobj[0];
    if (!obj) return 'null'
    str = opts.path
        ? $au.map(jobj.parents(), $au.inspect_node).reverse().join(' > ') + ' > '
        : '';
    str += obj.tagName;
    str += $au.map((obj.className || '').split(/\s+/), function(cn) {
      return cn && '.'+cn
    }).join('');
    if (obj.id)
      str += '#'+obj.id;
    if (objval || obj.name)
      str += '['+$au.compact([obj.name, '"'+objval+'"']).join('=')+']';
    if (jobj.attr('data-value') || jobj.attr('data-name'))
      '['+$au.compact([jobj.attr('data-name'), '"'+jobj.attr('data-value')+'"']).join('=')+']';
    if (!jobj.closest('html').length)
      str += ':detached';
    if (jobj.is(':hidden'))
      str += ':hidden';
    if (opts.text || opts.html)
      '= "'+(opts.text ? jobj.text() : opts.html ? obj.innerHTML : '')+'"';
    return str;
  },
  
  htmlize: function(obj, templates, forced_object, recur_forced) {
    if (typeof obj == 'undefined')
      return 'undefined';
    if (obj === null)
      return 'null'
    if (typeof obj == 'number')
      return '<a class="number">'+obj+'</a>';
    if (jQuery.isArray(obj))
      return '<ol>'+$au.map(obj, function(i) {return '<li>'+$au.htmlize(i)+'</li>'}).join('\n')+'</ol>';
    if (jQuery.isPlainObject(obj)) {
      if (templates)
        for (var type in templates)
          if (obj.type === type)
            return templates[type]({obj: obj});
      return '<ul>'+$au.map(obj, function(k, v) {return '<li><a class="key">'+k+'</a>: <div class="value">'+$au.htmlize(v)+'</div></li>'}).join(', ')+'<ul>';
    }
    if (!forced_object)
      return '<a class="string">"'+obj+'"</a>';
    return '{'+$au.map($au.object(obj), function(k, v) {return k+': '+$au.inspect(v, templates, recur_forced, recur_forced)}).join(', ')+'}';
  },
  
  css_path: function(obj, with_html) {
    return $au.map((with_html ? $(obj).parents() : $(obj).parents()).andSelf().toArray(), $au.inspect).join(' > ');
  },
  
  log: function(obj) {
    console.log(caller(1),$au.inspect(obj));
  },
  
  
  
  /* DEEP COPY */
  clone: function(obj) {
    var newObj = (obj instanceof Array) ? [] : {};
    for (var i in obj) {
      o = obj[i];
      newObj[i] = (o && typeof o == "object") ? $au.clone(o) : o;
    }
    return newObj;
  },
  
  
  
  /* RAND */
  rand: function(obj) {
    if (obj instanceof jQuery || jQuery.isArray(obj)) return obj[parseInt(Math.random()*obj.length)];
    return obj[$au.rand($au.keys(obj))];
  },
  
  
  
  /* TIMES */
  // Iterates over range = ( m ? (0...n) : (m...n) )
  // With no interval returns results of callbacks for each number
  // With interval returns ids of timeouts for each n * interval
  times: function(n, m, fun, interval) {
    var ary = [];
    if (typeof m == 'function') interval = fun, fun = m, m = n, n = 0;
    for (n; n<m; n++) {
      ary.push(interval
        ? setTimeout(function() {
          if (fun(n)) $au.each(ary, clearTimeout); // break
        }, n*interval)
        : fun(n));
    };
    return ary;
  },
  
};

/// aliases
$au.union = $au.merge;
$au.fold = $au.reduce;