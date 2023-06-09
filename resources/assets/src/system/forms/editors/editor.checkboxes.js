/**
 * Checkboxes editor
 *
 * Renders a <ul> with given options represented as <li> objects containing checkboxes
 *
 * Requires an 'options' value on the schema.
 *  Can be an array of options, a function that calls back with the array of options, a string of HTML
 *  or a Backbone collection. If a collection, the models must implement a toString() method
 */
const $     = require('jquery');
const _     = require('underscore');
const Form  = require('@/system/forms/base');

module.exports = Form.editors.Select.extend({
    className: 'form-control-checkboxes',
    tagName: 'ul',
    groupNumber: 0,
    events: {
        'click input[type=checkbox]': function () {
            this.trigger('change', this);
        },
        'focus input[type=checkbox]': function () {
            if (this.hasFocus) return;
            this.trigger('focus', this);
        },
        'blur input[type=checkbox]': function () {
            if (!this.hasFocus) return;
            let self = this;
            setTimeout(function () {
                if (self.$('input[type=checkbox]:focus')[0]) return;
                self.trigger('blur', self);
            }, 0);
        },
    },
    getValue: function () {
        let values = [];
        let self = this;
        this.$('input[type=checkbox]:checked').each(function () {
            values.push(self.$(this).val());
        });
        return values;
    },
    setValue: function (values) {
        if (!_.isArray(values)) values = [values];
        this.value = values;
        this.$('input[type=checkbox]').val(values);
    },
    focus: function () {
        if (this.hasFocus) return;
        this.$('input[type=checkbox]').first().focus();
    },
    blur: function () {
        if (!this.hasFocus) return;
        this.$('input[type=checkbox]:focus').blur();
    },

    /**
     * Create the checkbox list HTML
     * @param {Array}   Options as a simple array e.g. ['option1', 'option2']
     *                      or as an array of objects e.g. [{val: 543, label: 'Title for object 543'}]
     * @return {String} HTML
     */
    _arrayToHtml: function (array) {
        let html = $();
        let self = this;

        _.each(array, function (option, index) {
            
            let itemHtml = $('<li>');

            if (_.isObject(option)) {
                if (option.group) {
                    let originalId = self.id;
                    self.id += '-' + self.groupNumber++;
                    itemHtml = $('<fieldset class="group">').append(
                        $('<legend>').text(option.group)
                    );
                    itemHtml = itemHtml.append(self._arrayToHtml(option.options));
                    self.id = originalId;
                    close = false;
                } else {
                    let val = option.val || option.val === 0 ? option.val : '';
                    itemHtml.append(
                        $(
                            '<input type="checkbox" name="' +
                                self.getName() +
                                '" id="' +
                                self.id +
                                '-' +
                                index +
                                '" />'
                        ).val(val)
                    );
                    if (option.labelHTML) {
                        itemHtml.append(
                            $('<label for="' + self.id + '-' + index + '" />').html(
                                option.labelHTML
                            )
                        );
                    } else {
                        itemHtml.append(
                            $('<label for="' + self.id + '-' + index + '" />').text(option.label)
                        );
                    }
                }
                
            } else {
                
                itemHtml.append(
                    $(
                        '<input type="checkbox" name="' +
                            self.getName() +
                            '" id="' +
                            self.id +
                            '-' +
                            index +
                            '" />'
                    ).val(option)
                );
                
                itemHtml.append($('<label for="' + self.id + '-' + index + '" />').text(option));
                
            }
            
            html = html.add(itemHtml);
        });
        return html;
    },
});
