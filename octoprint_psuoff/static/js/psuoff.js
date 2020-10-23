$(function() {
    function PSUOffViewModel(parameters) {
        var self = this;

        self.settingsViewModel = parameters[0]
        self.loginState = parameters[1];
        self.settings = undefined;
        self.hasGPIO = ko.observable(undefined);
        self.isPSUOn = ko.observable(undefined);
        self.psu_indicator = $("#psuoff_indicator");

        self.onBeforeBinding = function() {
            self.settings = self.settingsViewModel.settings;
        };

        self.onStartup = function () {
            self.isPSUOn.subscribe(function() {
                // signalizace zapnutého stavu
                self.psu_indicator.removeClass("off").addClass("on");
            });
            
            $.ajax({
                url: API_BASEURL + "plugin/psuoff",
                type: "POST",
                dataType: "json",
                data: JSON.stringify({
                    command: "getPSUState"
                }),
                contentType: "application/json; charset=UTF-8"
            }).done(function(data) {
                self.isPSUOn(data.isPSUOn);
            });
        }

        self.onDataUpdaterPluginMessage = function(plugin, data) {
            if (plugin != "psuoff") {
                return;
            }

            self.hasGPIO(data.hasGPIO);
            self.isPSUOn(data.isPSUOn);
        };

        self.turnoffPSU = function() {
			if (self.settings.plugins.psuoff.enablePowerOffWarningDialog()) {
				showConfirmationDialog({
					message: "You are about to turn off the PSU.",
					onproceed: function() {
						self.turnPSUOff();
					}
				});
			} else {
				self.turnPSUOff();
			}
        };

    	self.turnPSUOff = function() {
            $.ajax({
                url: API_BASEURL + "plugin/psuoff",
                type: "POST",
                dataType: "json",
                data: JSON.stringify({
                    command: "turn_psu_off"
                }),
                contentType: "application/json; charset=UTF-8"
            })
        };   
    }

    ADDITIONAL_VIEWMODELS.push([
        PSUOffViewModel,
        ["settingsViewModel", "loginStateViewModel"],
        ["#navbar_plugin_psuoff", "#settings_plugin_psuoff"]
    ]);
});
