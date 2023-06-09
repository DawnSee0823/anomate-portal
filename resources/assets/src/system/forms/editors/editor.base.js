/**
 * Base editor (interface). To be extended, not used directly
 *
 * @param {Object} options
 * @param {String} [options.id]         Editor ID
 * @param {Model} [options.model]       Use instead of value, and use commit()
 * @param {String} [options.key]        The model attribute key. Required when using 'model'
 * @param {Mixed} [options.value]       When not using a model. If neither provided, defaultValue will be used
 * @param {Object} [options.schema]     Field schema; may be required by some editors
 * @param {Object} [options.validators] Validators; falls back to those stored on schema
 * @param {Object} [options.form]       The form
 */
 
const Backbone  = require('backbone');
const _         = require('underscore');
const Form      = require('@/system/forms/base');

module.exports = Backbone.View.extend({
    className: 'form-control',
    defaultValue: null,
    hasFocus: false,
    initialize: function (options) {
        options = options || {};

        //Set initial value
        if (options.model) {
            if (!options.key) {
                throw new Error("Missing option: 'key'");
            }
            this.model = options.model;
            this.value = this.model.get(options.key);
        } else if (options.value !== undefined) {
            this.value = options.value;
        }

        if (this.value === undefined) {
            this.value = this.defaultValue;
        }

        //Store important data
        _.extend(this, _.pick(options, 'key', 'form'));

        let schema = (this.schema = options.schema || {});

        this.validators = options.validators || schema.validators;

        //Main attributes
        this.$el.attr('id', this.id);
        this.$el.attr('name', this.getName());

        if (schema.editorClass) {
            this.$el.addClass(schema.editorClass);
        }

        if (schema.editorAttrs) {
            this.$el.attr(schema.editorAttrs);
        }
        
    },

    /**
     * Get the value for the form input 'name' attribute
     *
     * @return {String}
     *
     * @api private
     */
    getName: function () {
        let key = this.key || '';

        //Replace periods with underscores (e.g. for when using paths)
        return key.replace(/\./g, '_');
    },

    /**
     * Get editor value
     * Extend and override this method to reflect changes in the DOM
     *
     * @return {Mixed}
     */
    getValue: function () {
        return this.value;
    },

    /**
     * Set editor value
     * Extend and override this method to reflect changes in the DOM
     *
     * @param {Mixed} value
     */
    setValue: function (value) {
        this.value = value;
    },

    /**
     * Give the editor focus
     * Extend and override this method
     */
    focus: function () {
        throw new Error('Not implemented');
    },

    /**
     * Remove focus from the editor
     * Extend and override this method
     */
    blur: function () {
        throw new Error('Not implemented');
    },

    /**
     * Update the model with the current value
     *
     * @param {Object} [options]              Options to pass to model.set()
     * @param {Boolean} [options.validate]    Set to true to trigger built-in model validation
     *
     * @return {Mixed} error
     */
    commit: function (options) {
        let error = this.validate();

        if (error) {
            return error;
        }

        this.listenTo(this.model, 'invalid', function (model, e) {
            error = e;
        });

        this.model.set(this.key, this.getValue(), options);

        if (error) {
            return error;
        }
    },

    /**
     * Check validity
     *
     * @return {Object|Undefined}
     */
    validate: function () {
        let $el = this.$el,
            error = null,
            value = this.getValue(),
            formValues = this.form ? this.form.getValue() : {},
            validators = this.validators,
            getValidator = this.getValidator;

        if (validators) {
            //Run through validators until an error is found
            _.every(validators, function (validator) {
                error = getValidator(validator)(value, formValues);

                return error ? false : true;
            });
        }

        return error;
    },

    /**
     * Set this.hasFocus, or call parent trigger()
     *
     * @param {String} event
     */
    trigger: function (event) {
        if (event === 'focus') {
            this.hasFocus = true;
        } else if (event === 'blur') {
            this.hasFocus = false;
        }

        return Backbone.View.prototype.trigger.apply(this, arguments);
    },

    /**
     * Returns a validation function based on the type defined in the schema
     *
     * @param {RegExp|String|Function} validator
     * @return {Function}
     */
    getValidator: function (validator) {
        let validators = Form.validators;

        //Convert regular expressions to validators
        if (_.isRegExp(validator)) {
            return validators.regexp({ regexp: validator });
        }

        //Use a built-in validator if given a string
        if (_.isString(validator)) {
            if (!validators[validator]) throw new Error('Validator "' + validator + '" not found');

            return validators[validator]();
        }

        //Functions can be used directly
        if (_.isFunction(validator)) return validator;

        //Use a customised built-in validator if given an object
        if (_.isObject(validator) && validator.type) {
            let config = validator;

            return validators[config.type](config);
        }

        //Unkown validator type
        throw new Error('Invalid validator: ' + validator);
    },
});