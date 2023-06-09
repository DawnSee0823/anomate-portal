/**
 * Checkbox editor
 *
 * Creates a single checkbox, i.e. boolean value
 */
const Form  = require('@/system/forms/base');
const _             = require('underscore');

module.exports = Form.editors.Base.extend({
    className: 'form-control-checkboxes',
    defaultValue: false,
    tagName: 'input',
    events: {
        click: function (event) {
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
        this.$el.attr('type', 'checkbox');
    },
    /**
     * Adds the editor to the DOM
     */
    render: function () {
        this.setValue(this.value);
        return this;
    },
    getValue: function () {
        return this.$el.prop('checked');
    },
    setValue: function (value) {
        if (value) {
            this.$el.prop('checked', true);
        } else {
            this.$el.prop('checked', false);
        }
        this.value = !!value;
    },
    focus: function () {
        if (this.hasFocus) return;
    
        this.$el.focus();
    },
    blur: function () {
        if (!this.hasFocus) return;
        this.$el.blur();
    },
});