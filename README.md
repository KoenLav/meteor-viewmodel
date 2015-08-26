dalgard:viewmodel 0.1.1
=======================

Minimalist VM for Meteor – inspired by `manuel:viewmodel` and `nikhizzle:session-bind`.

- Highly declarative
- Absolutely no redundant syntax
- Reactive and terse API
- Easily extensible


#### Install

*(Atmosphere coming soon)*

Copy the `package` folder (can be renamed) from this repo into your project's `/packages` and add it with `meteor install dalgard:viewmodel`.


## Usage

The example below is a bit verbose; viewmodels do not always have to be declared, but may be created automatically by the `{{bind}}` helper if registered globally.

Check out the other `/examples` in the repo.

```html
<template name="page">
  {{> field startValue='yo'}} {{fieldProp}}
</template>

<template name="field">
  <input type="text" {{bind 'value: prop'}}>
</template>
```

```javascript
Template.page.viewmodel({
  // All properties are registered as Blaze helpers
  fieldProp: function () {
    // Get child viewmodel reactively by name
    var field = this.child("field");

    // Child may not be rendered the first time this value is used
    return field && field.prop();
  },

  // Blaze onCreated hook (similar for rendered and destroyed)
  // – can be an array of functions
  created: function () {
    this instanceof ViewModel;  // true
  }
});

// Instead of a definition object, a factory function may be used
Template.field.viewmodel("field", function (template_data) {
  this instanceof ViewModel;  // true

  return {
    // Primitive property
    prop: template_data && template_data.startValue || "",

    // Computed property
    regex: function () {
      // Get value of prop reactively
      var value = this.prop();

      return new RexExp(value);
    },

    // React to changes in dependencies such as viewmodel properties
    // – can be an array of functions
    autorun: function () {
      // Log every time the computed regex property changes
      console.log("new value of regex", this.regex());
    },

    // Blaze events
    events: {
      "click input": function (event, template_instance) {
        this instanceof ViewModel;  // true
      }
    }
  };
});
```


## API

This is an extract of the full API. Take five minutes to explore the ViewModel class with `dir(ViewModel)` and viewmodel instances with `debugger;` in your dev-tools of choice.

### {{bind}}

This Blaze helper is only registered on templates with a declared viewmodel. The name of the helper may be changed:

```javascript
ViewModel.helperName = "myBind";
```

You may choose to register the helper globally:

```javascript
// Name is optional
ViewModel.registerHelper(name);
```

The advantage of registering `{{bind}}` globally is that you may use it inside any template without first declaring a viewmodel.

Using the helper then automatically creates a new viewmodel instance (if none existed) and immediately registers the bound key as a Blaze helper – this helper can then be used anywhere *after* the call to `{{bind}}`, but not before. If you want to be able to place a property helper anywhere in the template, declare the viewmodel explicitly.

The syntax of the bind helper looks like this:

```html
{{bind expression ...}}
```

... where `expression` is a string formatted as a key/value pair:

```javascript
'binding: key'
```

You may pass multiple bind expressions to the helper.

Any space separated values placed after the viewmodel key (i.e. the name of a property) inside the bind expression are passed as arguments to the binding – for instance, delay:

```html
<input type="text" {{bind 'value: search 1500'}}>
```

### Viewmodel instances

ViewModel can be used in a more programmatical way, but below are the methods that are recommended for use inside computed properties, autoruns etc. when sticking to a more declarative approach.

Templates:

```javascript
// Get the current template instance
this.templateInstance();

// Reactively get the data context of the current template instance
this.getData();
```

Serialization:

```javascript
// Get a snapshot of the viewmodel, ready for serialization
this.serialize();

// Apply a snapshot to the viewmodel
this.deserialize(object);
```

Traversal:

```javascript
// Reactively get the parent viewmodel, optionally filtered by name (string or regex)
this.parent([name]);

// Reactively get the first ancestor viewmodel at index, optionally filtered by name
// (string or regex)
this.ancestor([name][, index=0]);

// Reactively get an array of ancestor viewmodels or the first at index (within a depth
// of levels), optionally filtered by name (string or regex)
this.ancestors([name][, index][, levels]);

// Reactively get the first child viewmodel at index, optionally filtered by name
// (string or regex)
this.child([name][, index]);

// Reactively get an array of descendant viewmodels or the first at index (within a depth
// of levels), optionally filtered by name (string or regex)
this.children([name][, index]);

// Reactively get the first descendant viewmodel at index, optionally filtered by name
// (string or regex)
this.descendant([name][, index=0]);

// Reactively get an array of descendant viewmodels or the first at index (within a depth
// of levels), optionally filtered by name (string or regex)
this.descendants([name][, index][, levels]);
```


### Static methods

These methods are mainly for inspection while developing, but may also be used as a means of getting a component in a complex layout.

```javascript
// Reactively get global list of current viewmodels
ViewModel.all();

// Reactively get an array of current viewmodels or the first at index, optionally filtered
// by name (string or regex)
ViewModel.find([name][, index]);

// Reactively get the first current viewmodel, optionally filtered by name (string or regex)
ViewModel.findOne([name]);
```

### addBinding

The job of a binding is to synchronize data between the DOM and the viewmodel. Bindings are added through simple definition objects:

```javascript
// All three properties on the definition object are optional
ViewModel.addBinding(name, {
  // Apply updated value to the DOM
  set: function ($elem, new_value, args, kwargs) {
    this instanceof ViewModel;  // true

    // For example
    $elem.val(new_value);
  };

  // Space separated list of events
  on: "keyup input change",

  // Possibly return a value retrieved from the DOM
  get: function (event, $elem, prop, args, kwargs) {
    this instanceof ViewModel;  // true

    // For example
    return $elem.val();
  }
});
```

`$elem` is the jQuery wrapped element where the `{{bind}}` helper was called.

`args` is a possibly empty array containing any space separated values following the key in the bind expression.

`kwargs` is the keyword arguments that the `{{bind}}` helper was called with.

The returned value from the `get` function is written directly to the bound property. However, if the function doesn't return anything (i.e. returns `undefined`), the bound property is not called at all. This is practical in case you only want to call the bound property in *some* cases.

Here's an example:

```javascript
ViewModel.addBinding("enterKey", {
  on: "keyup",

  get: function (event, elem, prop) {
    if (event.which === 13)
      // Prop is the getter/setter function of the viewmodel property, which sometimes
      // will simply be a method with side effects on the viewmodel
      prop();
  }
});
```

If you want to call the bound property but not do so with a value, simply omit the `get` function altogether.

Here's the full definition of the `click` binding:

```javascript
ViewModel.addBinding("click", {
  on: "click"
});
```

A definition object may also be returned from a factory function, which is called with some useful arguments:

```javascript
ViewModel.addBinding(name, function (template_data, key, args, kwargs) {
  // Return definition object
  return {};
});
```


## Todo

- Persist viewmodels on hot code pushes.
- Optionally persist viewmodel across routes.
- Optionally register bindings as individual helpers.
