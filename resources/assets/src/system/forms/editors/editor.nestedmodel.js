/**
 * NestedModel editor
 *
 * Creates a child form. For editing nested Backbone models
 *
 * Special options:
 *   schema.model:   Embedded model constructor
 */
const Form          = require('@/system/forms/base');

module.exports = Form.editors.Object.extend({
    initialize: function (options) {
        Form.editors.Base.prototype.initialize.call(this, options);

        if (!this.form) throw new Error('Missing required option "form"');
        if (!options.schema.model)
            throw new Error('Missing required "schema.model" option for NestedModel editor');
    },

    render: function () {
        //Get the constructor for creating the nested form; i.e. the same constructor as used by the parent form
        let NestedForm = this.form.constructor;

        let data = this.value || {},
            key = this.key,
            nestedModel = this.schema.model;

        //Wrap the data in a model if it isn't already a model instance
        let modelInstance = data.constructor === nestedModel ? data : new nestedModel(data);

        this.nestedForm = new NestedForm({
            model: modelInstance,
            idPrefix: this.id + '_',
            fieldTemplate: 'nestedField',
        });

        this._observeFormEvents();

        //Render form
        this.$el.html(this.nestedForm.render().el);

        if (this.hasFocus) this.trigger('blur', this);

        return this;
    },

    /**
     * Update the embedded model, checking for nested validation errors and pass them up
     * Then update the main model if all OK
     *
     * @return {Error|null} Validation error or null
     */
    commit: function () {
        let error = this.nestedForm.commit();
        if (error) {
            this.$el.addClass('error');
            return error;
        }

        return Form.editors.Object.prototype.commit.call(this);
    },
});
