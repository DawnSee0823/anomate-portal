/**
 * Select editor
 *
 * Renders a <select> with given options
 *
 * Requires an 'options' value on the schema.
 *  Can be an array of options, a function that calls back with the array of options, a string of HTML
 *  or a Backbone collection. If a collection, the models must implement a toString() method
 */
const $             = require('jquery');
const Backbone      = require('backbone');
const _             = require('underscore');
const Form          = require('@/system/forms/base');

module.exports = Form.editors.Base.extend({
    tagName: 'select',

    previousValue: '',

    events: {
        keyup: 'determineChange',
        keypress: function (event) {
            let self = this;
            setTimeout(function () {
                self.determineChange();
            },0);
        },
        change: function (event) {
            this.trigger('change', this);
        },
        focus: function (event) {
            this.trigger('focus', this);
        },
        blur: function (event) {
            this.trigger('blur', this);
        },
    },

    initialize: function (options) {
        Form.editors.Base.prototype.initialize.call(this, options);
        if (!this.schema || !this.schema.options)
            throw new Error("Missing required 'schema.options'");
    },

    render: function () {
        this.setOptions(this.schema.options);
        return this;
    },

    /**
     * Sets the options that populate the <select>
     *
     * @param {Mixed} options
     */
    setOptions: function (options) {
        let self = this;

        //If a collection was passed, check if it needs fetching
        if (options instanceof Backbone.Collection) {
            let collection = options;
            //Don't do the fetch if it's already populated
            if (collection.length > 0) {
                this.renderOptions(options);
            } else {
                collection.fetch({
                    success: function (collection) {
                        self.renderOptions(options);
                    },
                });
            }
        }

        //If a function was passed, run it to get the options
        else if (_.isFunction(options)) {
            options(function (result) {
                self.renderOptions(result);
            }, self);
        }

        //Otherwise, ready to go straight to renderOptions
        else {
            this.renderOptions(options);
        }
    },

    renderOptions: function (options) {
        let $select = this.$el,html;
        html = this._getOptionsHtml(options);
        //Insert options
        $select.html(html);
        //Select correct option
        this.setValue(this.value);
    },

    _getOptionsHtml: function (options) {
        let html;

        //Accept string of HTML
        if (_.isString(options)) {
            html = options;
        } else if (_.isArray(options)) {
            html = this._arrayToHtml(options);
        } else if (options instanceof Backbone.Collection) {
            html = this._collectionToHtml(options);
        } else if (_.isFunction(options)) {
            let newOptions;
            options(function (opts) {
                newOptions = opts;
            }, this);
            html = this._getOptionsHtml(newOptions);
        } else {
            html = this._objectToHtml(options);
        }

        return html;
    },

    determineChange: function (event) {
        let currentValue = this.getValue();
        let changed = currentValue !== this.previousValue;

        if (changed) {
            this.previousValue = currentValue;

            this.trigger('change', this);
        }
    },

    getValue: function () {
        return this.$el.val();
    },

    setValue: function (value) {
        this.value = value;
        this.$el.val(value);
    },

    focus: function () {
        if (this.hasFocus) return;

        this.$el.focus();
    },

    blur: function () {
        if (!this.hasFocus) return;

        this.$el.blur();
    },

    /**
     * Transforms a collection into HTML ready to use in the renderOptions method
     * @param {Backbone.Collection}
     * @return {String}
     */
    _collectionToHtml: function (collection) {
        //Convert collection to array first
        let array = [];

        collection.each(function (model) {
            array.push({
                val: model.id,
                label: model.toString(),
            });
        });

        //Now convert to HTML
        let html = this._arrayToHtml(array);

        return html;
    },
    /**
     * Transforms an object into HTML ready to use in the renderOptions method
     * @param {Object}
     * @return {String}
     */
    _objectToHtml: function (obj) {
        //Convert object to array first
        let array = [];
        for (let key in obj) {
            if (obj.hasOwnProperty(key)) {
                array.push({ val: key, label: obj[key] });
            }
        }

        //Now convert to HTML
        let html = this._arrayToHtml(array);

        return html;
    },

    /**
     * Create the <option> HTML
     * @param {Array}   Options as a simple array e.g. ['option1', 'option2']
     *                      or as an array of objects e.g. [{val: 543, label: 'Title for object 543'}]
     * @return {String} HTML
     */
    _arrayToHtml: function (array) {
        let html = $();

        //Generate HTML
        _.each(
            array,
            function (option) {
                if (_.isObject(option)) {
                    if (option.group) {
                        let optgroup = $('<optgroup>')
                            .attr('label', option.group)
                            .html(this._getOptionsHtml(option.options));
                        html = html.add(optgroup);
                    } else {
                        let val = option.val || option.val === 0 ? option.val : '';
                        html = html.add($('<option>').val(val).text(option.label));
                    }
                } else {
                    html = html.add($('<option>').text(option));
                }
            },
            this
        );

        return html;
    },
});