// Dependecies
const Backbone          = require('backbone');
const _                 = require('underscore');
const TemplateSettings  = require('@/system/forms/templates/settings');

module.exports =  Backbone.View.extend(
    {
        /**
         * Constructor
         *
         * Valid fieldset schemas:
         *   ['field1', 'field2']
         *   { legend: 'Some Fieldset', fields: ['field1', 'field2'] }
         *
         * @param {String[]|Object[]} options.schema      Fieldset schema
         * @param {Object} options.fields           Form fields
         */
        initialize: function (options) {
            options = options || {};

            //Create the full fieldset schema, merging defaults etc.
            let schema = (this.schema = this.createSchema(options.schema));

            //Store the fields for this fieldset
            this.fields = _.pick(options.fields, schema.fields);

            //Override defaults
            this.template =
                options.template || schema.template || this.template || this.constructor.template;
        },

        /**
         * Creates the full fieldset schema, normalising, merging defaults etc.
         *
         * @param {String[]|Object[]} schema
         *
         * @return {Object}
         */
        createSchema: function (schema) {
            //Normalise to object
            if (_.isArray(schema)) {
                schema = { fields: schema };
            }

            //Add null legend to prevent template error
            schema.legend = schema.legend || null;

            return schema;
        },

        /**
         * Returns the field for a given index
         *
         * @param {Number} index
         *
         * @return {Field}
         */
        getFieldAt: function (index) {
            let key = this.schema.fields[index];

            return this.fields[key];
        },

        /**
         * Returns data to pass to template
         *
         * @return {Object}
         */
        templateData: function () {
            return this.schema;
        },

        /**
         * Renders the fieldset and fields
         *
         * @return {Fieldset} this
         */
        render: function () {
            let schema = this.schema,
                fields = this.fields,
                $ = Backbone.$;

            //Render fieldset
            let $fieldset = $($.trim(this.template(_.result(this, 'templateData'))));

            //Render fields
            $fieldset
                .find('[data-fields]')
                .add($fieldset)
                .each(function (i, el) {
                    let $container = $(el),
                        selection = $container.attr('data-fields');

                    if (_.isUndefined(selection)) return;

                    _.each(fields, function (field) {
                        $container.append(field.render().el);
                    });
                });

            this.setElement($fieldset);

            return this;
        },

        /**
         * Remove embedded views then self
         */
        remove: function () {
            _.each(this.fields, function (field) {
                field.remove();
            });

            Backbone.View.prototype.remove.call(this);
        },
    },
    {
        //STATICS

        template: _.template(
            '<fieldset data-fields>' +
                '<% if (legend) { %>' +
                '<legend><%= legend %></legend>' +
                '<% } %>' +
            '</fieldset>',
            null,
            TemplateSettings
        ),
    }
);