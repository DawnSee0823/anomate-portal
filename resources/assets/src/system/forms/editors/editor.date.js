/**
 * Date editor
 *
 * Schema options
 * @param {Number|String} [options.schema.yearStart]  First year in list. Default: 100 years ago
 * @param {Number|String} [options.schema.yearEnd]    Last year in list. Default: current year
 *
 * Config options (if not set, defaults to options stored on the main Date class)
 * @param {Boolean} [options.showMonthNames]  Use month names instead of numbers. Default: true
 * @param {String[]} [options.monthNames]     Month names. Default: Full English names
 */
const Backbone      = require('backbone');
const Form          = require('@/system/forms/base');
const _             = require('underscore');

module.exports = Form.editors.Base.extend(
    {
        events: {
            'change select': function () {
                this.updateHidden();
                this.trigger('change', this);
            },
            'focus select': function () {
                if (this.hasFocus) return;
                this.trigger('focus', this);
            },
            'blur select': function () {
                if (!this.hasFocus) return;
                let self = this;
                setTimeout(function () {
                    if (self.$('select:focus')[0]) return;
                    self.trigger('blur', self);
                }, 0);
            },
        },

        initialize: function (options) {
            options = options || {};

            Form.editors.Base.prototype.initialize.call(this, options);

            let Self = Form.editors.Date,
                today = new Date();

            //Option defaults
            this.options = _.extend(
                {
                    monthNames: Self.monthNames,
                    showMonthNames: Self.showMonthNames,
                },
                options
            );

            //Schema defaults
            this.schema = _.extend(
                {
                    yearStart: today.getFullYear() - 100,
                    yearEnd: today.getFullYear(),
                },
                options.schema || {}
            );

            //Cast to Date
            if (this.value && !_.isDate(this.value)) {
                this.value = new Date(this.value);
            }

            //Set default date
            if (!this.value) {
                let date = new Date();
                date.setSeconds(0);
                date.setMilliseconds(0);

                this.value = date;
            }

            //Template
            this.template = options.template || this.constructor.template;
        },

        render: function () {
            let options = this.options,
                schema = this.schema,
                $ = Backbone.$;

            let datesOptions = _.map(_.range(1, 32), function (date) {
                return '<option value="' + date + '">' + date + '</option>';
            });

            let monthsOptions = _.map(_.range(0, 12), function (month) {
                let value = options.showMonthNames ? options.monthNames[month] : month + 1;

                return '<option value="' + month + '">' + value + '</option>';
            });

            let yearRange =
                schema.yearStart < schema.yearEnd
                    ? _.range(schema.yearStart, schema.yearEnd + 1)
                    : _.range(schema.yearStart, schema.yearEnd - 1, -1);

            let yearsOptions = _.map(yearRange, function (year) {
                return '<option value="' + year + '">' + year + '</option>';
            });

            //Render the selects
            let $el = $(
                $.trim(
                    this.template({
                        dates: datesOptions.join(''),
                        months: monthsOptions.join(''),
                        years: yearsOptions.join(''),
                    })
                )
            );

            //Store references to selects
            this.$date = $el.find('[data-type="date"]');
            this.$month = $el.find('[data-type="month"]');
            this.$year = $el.find('[data-type="year"]');

            //Create the hidden field to store values in case POSTed to server
            this.$hidden = $('<input type="hidden" name="' + this.key + '" />');
            $el.append(this.$hidden);

            //Set value on this and hidden field
            this.setValue(this.value);

            //Remove the wrapper tag
            this.setElement($el);
            this.$el.attr('id', this.id);
            this.$el.attr('name', this.getName());

            if (this.hasFocus) this.trigger('blur', this);

            return this;
        },

        /**
         * @return {Date}   Selected date
         */
        getValue: function () {
            let year = this.$year.val(),
                month = this.$month.val(),
                date = this.$date.val();

            if (!year || !month || !date) return null;

            return new Date(year, month, date);
        },

        /**
         * @param {Date} date
         */
        setValue: function (date) {
            this.value = date;
            this.$date.val(date.getDate());
            this.$month.val(date.getMonth());
            this.$year.val(date.getFullYear());

            this.updateHidden();
        },

        focus: function () {
            if (this.hasFocus) return;

            this.$('select').first().focus();
        },

        blur: function () {
            if (!this.hasFocus) return;

            this.$('select:focus').blur();
        },

        /**
         * Update the hidden input which is maintained for when submitting a form
         * via a normal browser POST
         */
        updateHidden: function () {
            let val = this.getValue();

            if (_.isDate(val)) val = val.toISOString();

            this.$hidden.val(val);
        },
    },
    {
        //STATICS
        template: _.template(
            '\
              <div class="form-inline-calendar">\
                <div class="input-calendar input-date">\
                    <select class="form-control" data-type="date"><%= dates %></select>\
                </div>\
                <div class="input-calendar input-month">\
                    <select class="form-control" data-type="month"><%= months %></select>\
                </div>\
                <div class="input-calendar input-year">\
                    <select class="form-control" data-type="year"><%= years %></select>\
                </div>\
              </div>\
            ',
            null,
            Form.templateSettings
        ),

        //Whether to show month names instead of numbers
        showMonthNames: true,

        //Month names to use if showMonthNames is true
        //Replace for localisation, e.g. Form.editors.Date.monthNames = ['Janvier', 'Fevrier'...]
        monthNames: [
            'January',
            'February',
            'March',
            'April',
            'May',
            'June',
            'July',
            'August',
            'September',
            'October',
            'November',
            'December',
        ],
    }
);