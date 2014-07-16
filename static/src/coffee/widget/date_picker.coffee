define [
  "underscore"
  "jquery"
  "jquery_ui/datepicker"
  "backbone"
  "common/continuum_view"
  "common/has_properties"
], (_, $, $1, Backbone, continuum_view, HasProperties) ->

  class DatePickerView extends continuum_view.View

    initialize : (options) ->
      super(options)
      @render()

    render: () ->
      @$el.empty()
      $label = $('<label>').text(@mget("title"))
      $datepicker = $("<div>").datepicker({
        defaultDate: new Date(@mget('value'))
        minDate: if @mget('min_date')? then new Date(@mget('min_date')) else null
        maxDate: if @mget('max_date')? then new Date(@mget('max_date')) else null
        onSelect: @onSelect
      })
      @$el.append([$label, $datepicker])

    onSelect: (dateText, ui) =>
      @mset('value', new Date(dateText))
      @model.save()

  class DatePicker extends HasProperties
    type: "DatePicker"
    default_view: DatePickerView
    defaults: () ->
      return {
        value: Date.now()
      }

  class DatePickers extends Backbone.Collection
    model: DatePicker

  return {
    Model: DatePicker
    Collection: new DatePickers()
    View: DatePickerView
  }
