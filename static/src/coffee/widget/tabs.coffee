define [
  "underscore"
  "jquery"
  "bootstrap/tab"
  "backbone"
  "common/continuum_view"
  "common/has_properties"
  "common/build_views"
  "./tabs_template"
], (_, $, $1, Backbone, continuum_view, HasProperties, build_views, tabs_template) ->

  class TabsView extends continuum_view.View

    initialize : (options) ->
      super(options)
      @views = {}
      @render()

    render: () ->
      for own key, val of @views
        val.$el.detach()
      @$el.empty()

      tabs = @mget_obj('tabs')
      active = @mget("active")

      children = (tab.get_obj("child") for tab in tabs)
      build_views(@views, children)

      html = $(tabs_template({
        tabs: tabs
        active: (i) -> if i == active then 'bk-bs-active' else ''
      }))

      html.find("> li > a").click (event) ->
        event.preventDefault()
        $(this).tab('show')

      $panels = html.children(".bk-bs-tab-pane")

      for [child, panel] in _.zip(children, $panels)
        $(panel).html(@views[child.id].$el)

      @$el.append(html)
      @$el.tabs

  class Tabs extends HasProperties
    type: "Tabs"
    default_view: TabsView
    defaults: () ->
      return {
        tabs: []
        active: 0
      }

  class Tabses extends Backbone.Collection
    model: Tabs

  return {
    Model: Tabs
    Collection: new Tabses()
    View: TabsView
  }
