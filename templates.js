this["MMMTransmissionStats"] = this["MMMTransmissionStats"] || {};
this["MMMTransmissionStats"]["Templates"] = this["MMMTransmissionStats"]["Templates"] || {};

this["MMMTransmissionStats"]["Templates"]["update"] = Handlebars.template({"1":function(container,depth0,helpers,partials,data) {
    var helper, alias1=depth0 != null ? depth0 : {}, alias2=helpers.helperMissing, alias3="function", alias4=container.escapeExpression;

  return "	<td class=\"mmmts-total-down\">"
    + alias4(((helper = (helper = helpers.totalDown || (depth0 != null ? depth0.totalDown : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"totalDown","hash":{},"data":data}) : helper)))
    + "</td>\n	<td class=\"mmmts-total-up\">"
    + alias4(((helper = (helper = helpers.totalUp || (depth0 != null ? depth0.totalUp : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"totalUp","hash":{},"data":data}) : helper)))
    + "</td>\n";
},"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, helper, alias1=depth0 != null ? depth0 : {}, alias2=helpers.helperMissing, alias3="function", alias4=container.escapeExpression;

  return "	<td class=\"mmmts-icon\"><span class=\"fa fa-"
    + alias4(((helper = (helper = helpers.serverIcon || (depth0 != null ? depth0.serverIcon : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"serverIcon","hash":{},"data":data}) : helper)))
    + "\" title=\""
    + alias4(((helper = (helper = helpers.serverLabel || (depth0 != null ? depth0.serverLabel : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"serverLabel","hash":{},"data":data}) : helper)))
    + "\"></span></td>\n	<td class=\"mmmts-active\">"
    + alias4(((helper = (helper = helpers.totalActive || (depth0 != null ? depth0.totalActive : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"totalActive","hash":{},"data":data}) : helper)))
    + "</td>\n	<td class=\"mmmts-paused\">"
    + alias4(((helper = (helper = helpers.totalInactive || (depth0 != null ? depth0.totalInactive : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"totalInactive","hash":{},"data":data}) : helper)))
    + "</td>\n	<td class=\"mmmts-speed-down\">"
    + alias4(((helper = (helper = helpers.totalRateDown || (depth0 != null ? depth0.totalRateDown : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"totalRateDown","hash":{},"data":data}) : helper)))
    + "</td>\n	<td class=\"mmmts-speed-up\">"
    + alias4(((helper = (helper = helpers.totalRateUp || (depth0 != null ? depth0.totalRateUp : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"totalRateUp","hash":{},"data":data}) : helper)))
    + "</td>\n"
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.showCumulative : depth0),{"name":"if","hash":{},"fn":container.program(1, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "");
},"useData":true});

this["MMMTransmissionStats"]["Templates"]["updateTable"] = Handlebars.template({"1":function(container,depth0,helpers,partials,data) {
    return "cumulative-enabled";
},"3":function(container,depth0,helpers,partials,data) {
    return "			<th class=\"mmmts-total-down\">\n				<span class=\"fa fa-download\"></span>\n			</th>\n			<th class=\"mmmts-total-up\">\n				<span class=\"fa fa-upload\"></span>\n			</th>\n";
},"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=depth0 != null ? depth0 : {};

  return "<table class=\"xsmall light "
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.showCumulative : depth0),{"name":"if","hash":{},"fn":container.program(1, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "\">\n	<thead>\n		<tr>\n			<th class=\"mmmts-icon\">\n				&nbsp;\n			</th>\n			<th class=\"mmmts-active\">\n				<span class=\"fa fa-play\"></span>\n			</th>\n			<th class=\"mmmts-paused\">\n				<span class=\"fa fa-pause\"></span>\n			</th>\n			<th class=\"mmmts-speed-down\">\n				<span class=\"fa fa-cloud-download\"></span>\n			</th>\n			<th class=\"mmmts-speed-up\">\n				<span class=\"fa fa-cloud-upload\"></span>\n			</th>\n"
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.showCumulative : depth0),{"name":"if","hash":{},"fn":container.program(3, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "		</tr>\n	</thead>\n	<tbody>\n		\n	</tbody>\n</table>";
},"useData":true});