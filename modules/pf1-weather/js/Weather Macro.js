var pf1Weather = {
	theClimate: "",
	
	theSeason: "",
	
	baselineTemp: 0,
	
	/*
	Table: Climate Baselines
	Climate		Winter Temp.	Spring Temp.	Summer Temp.	Fall Temp.	Precipitation Adjustment
	Cold		20º F			30º F			40º F			30º F		Decrease frequency and intensity by one step
	Temperate	30º F			60º F			80º F			60º F		—
	Tropical	50º F			75º F			95º F			75º F		Increase frequency and intensity by one step
	*/
	ClimateBaselines: {
		"Cold": {
			"Winter": 20,
			"Spring": 30,
			"Summer": 40,
			"Fall": 30,
			"Percip Freq Mod": -1,
			"Percip Inten Mod": -1
		},
		"Temperate": {
			"Winter": 30,
			"Spring": 60,
			"Summer": 80,
			"Fall": 60,
			"Percip Freq Mod": 0,
			"Percip Inten Mod": 0
		},
		"Tropical": {
			"Winter": 50,
			"Spring": 75,
			"Summer": 95,
			"Fall": 75,
			"Percip Freq Mod": 1,
			"Percip Inten Mod": 1
		},
	},
	/*
	Table: Elevation Baselines
	Elevation	Altitude Range			Baseline Temp.		Adjust. Baseline Precipitation Intensity
	Sea level	Below 1,000 ft.			+10º F				Heavy
	Lowland		1,000 ft. to 5,000 ft.	—					Medium
	Highland	Above 5,000 ft.			–10º F				Medium (decrease precipitation frequency by one step)
	*/
	ElevationModifiers: {
		"Sea level": {
			"Temp Mod": 10,
			"Percip Baseline": 2,
			"Percip Freq Mod": 0
		},
		"Lowland": {
			"Temp Mod": 0,
			"Percip Baseline": 1,
			"Percip Freq Mod": 0
		},
		"Highland": {
			"Temp Mod": -10,
			"Percip Baseline": 1,
			"Percip Freq Mod": -1
		},
	},
	
	ClimateVariations: {
		/*
		Table: Cold Region Temperature Variations
		d%		Variation		Duration
		1–20	–3d10° F		1d4 days
		21–40	–2d10° F		1d6+1 days
		41–60	–1d10° F		1d6+2 days
		61–80	No variation	1d6+2 days
		81–95	+1d10° F		1d6+1 days
		96–99	+2d10° F		1d4 days
		100		+3d10° F		1d2 days
		*/
		"Cold": {
			5: {
				"Variation": "3d10",
				"Multiplier": -1,
				"Duration": "1d4"
			},
			15: {
				"Variation": "2d10",
				"Multiplier": -1,
				"Duration": "1d6+1"
			},
			35: {
				"Variation": "1d10",
				"Multiplier": -1,
				"Duration": "1d6+2"
			},
			65: {
				"Variation": "0",
				"Multiplier": 1,
				"Duration": "1d6+2"
			},
			85: {
				"Variation": "1d10",
				"Multiplier": 1,
				"Duration": "1d6+1"
			},
			95: {
				"Variation": "2d10",
				"Multiplier": 1,
				"Duration": "1d4"
			},
			100: {
				"Variation": "3d10",
				"Multiplier": 1,
				"Duration": "1d2"
			}
		},
		/*
		Table: Temperate Region Temperature Variations
		d%		Variation		Duration
		1–5		–3d10° F		1d2 days
		6–15	–2d10° F		1d4 days
		16–35	–1d10° F		1d4+1 days
		36–65	No variation	1d6+1 days
		66–85	+1d10° F		1d4+1 days
		86–95	+2d10° F		1d4 days
		96–100	+3d10° F		1d2 days
		*/
		"Temperate": {
			5: {
				"Variation": "3d10",
				"Multiplier": -1,
				"Duration": "1d2"
			},
			15: {
				"Variation": "2d10",
				"Multiplier": -1,
				"Duration": "1d4"
			},
			35: {
				"Variation": "1d10",
				"Multiplier": -1,
				"Duration": "1d4+1"
			},
			65: {
				"Variation": "0",
				"Multiplier": 1,
				"Duration": "1d6+1"
			},
			85: {
				"Variation": "1d10",
				"Multiplier": 1,
				"Duration": "1d4+1"
			},
			95: {
				"Variation": "2d10",
				"Multiplier": 1,
				"Duration": "1d4"
			},
			100: {
				"Variation": "3d10",
				"Multiplier": 1,
				"Duration": "1d2"
			}
		},
		/*
		Table: Tropical Region Temperature Variations
		d%		Variation		Duration
		1–10	–2d10° F		1d2 days
		11–25	–1d10° F		1d2 days
		26–55	No variation	1d4 days
		56–85	+1d10° F		1d4 days
		86–100	+2d10° F		1d2 days
		*/
		"Tropical": {
			10: {
				"Variation": "2d10",
				"Multiplier": -1,
				"Duration": "1d2"
			},
			25: {
				"Variation": "1d10",
				"Multiplier": 1,
				"Duration": "1d2"
			},
			55: {
				"Variation": "0",
				"Multiplier": 1,
				"Duration": "1d4"
			},
			85: {
				"Variation": "1d10",
				"Multiplier": 1,
				"Duration": "1d4"
			},
			100: {
				"Variation": "2d10",
				"Multiplier": 1,
				"Duration": "1d2"
			}
		}
	},
	
	PercipitationFrequency: [
		"Drought",
		"Rare",
		"Intermittent",
		"Common",
		"Constant"
	],
	
	PercipitationIntensity: [
		"Light",
		"Medium",
		"Heavy",
		"Torrential"
	],
	/*
	Table: Seasonal Baselines
	Season		Cold or Temperate Climate Precip. Frequency				Tropical Climate Precip. Frequency
	Spring		Intermittent											Common
	Summer		Common													Intermittent
	Fall		Intermittent											Common
	Winter		Rare													Rare
	*/
	SeasonalPercipitationBaselines: {
		"Spring": {
			"Cold": 2,
			"Temperate": 2,
			"Tropical": 3
		},
		"Summer": {
			"Cold": 3,
			"Temperate": 3,
			"Tropical": 2
		},
		"Fall": {
			"Cold": 2,
			"Temperate": 2,
			"Tropical": 3
		},
		"Winter": {
			"Cold": 1,
			"Temperate": 1,
			"Tropical": 1
		}
	},
	/*
	Table: Daily Precipitation Chances
	Frequency		Chance of Precipitation
	Drought			5% (decrease precipitation intensity by two steps)
	Rare			15%
	Intermittent	30%
	Common			60%
	Constant		95%
	*/
	PrecipitationChances: {
		"Drought": {
			"chance": 5,
			"Percip Inten Mod": -2
		},
		"Rare": {
			"chance": 15,
			"Percip Inten Mod": 0
		},
		"Intermittent": {
			"chance": 30,
			"Percip Inten Mod": 0
		},
		"Common": {
			"chance": 60,
			"Percip Inten Mod": 0
		},
		"Constant": {
			"chance": 95,
			"Percip Inten Mod": 0
		}
	},
	
	WindData: {
		50: {
			WindStrength: "Light",
			WindSpeed: "0–10 mph",
			RangedWeaponPenalty: 0,
			SiegeWeaponPenalty: 0,
			CheckSize: "",
			BlownAwaySize: "",
			SkillPenalty: 0
		},
		80: {
			WindStrength: "Moderate",
			WindSpeed: "11–20 mph",
			RangedWeaponPenalty: 0,
			SiegeWeaponPenalty: 0,
			CheckSize: "",
			BlownAwaySize: "",
			SkillPenalty: 0
		},
		90: {
			WindStrength: "Strong",
			WindSpeed: "21–30 mph",
			RangedWeaponPenalty: -2,
			SiegeWeaponPenalty: 0,
			CheckSize: "Tiny",
			BlownAwaySize: "",
			SkillPenalty: -2
		},
		95: {
			WindStrength: "Severe",
			WindSpeed: "31–50 mph",
			RangedWeaponPenalty: -4,
			SiegeWeaponPenalty: 0,
			CheckSize: "Small",
			BlownAwaySize: "Tiny",
			SkillPenalty: -4
		},
		100: {
			WindStrength: "Windstorm",
			WindSpeed: "51+ mph",
			RangedWeaponPenalty: "Impossible",
			SiegeWeaponPenalty: -4,
			CheckSize: "Medium",
			BlownAwaySize: "Small",
			SkillPenalty: -8
		}
	},
	
	CloudCoverData: {
		50: "None",
		70: "Light Clouds",
		85: "Medium Clouds",
		100: "Overcast"
	},
	
	PercipitationTables: {
		"Light": {
			/*
			Table: Light Unfrozen Precipitation
			d%		Precipitation						Duration
			1–20	Fog, Light							1d8 hours
			21–40	Fog, Medium							1d6 hours
			41–50	Drizzle								1d4 hours
			51–75	Drizzle								2d12 hours
			76–90	Rain, Light							1d4 hours
			91–100	Rain, Light (sleet if below 40° F)	1 hour
			*/
			"Unfrozen": {
				20: {
					"Precipitation": "Fog, Light",
					"Duration": "1d8"
				},
				40: {
					"Precipitation": "Fog, Medium",
					"Duration": "1d6"
				},
				50: {
					"Precipitation": "Drizzle",
					"Duration": "1d4"
				},
				75: {
					"Precipitation": "Drizzle",
					"Duration": "2d12"
				},
				90: {
					"Precipitation": "Rain, Light",
					"Duration": "1d4"
				},
				100: {
					"Precipitation": "Rain, Light (sleet if below 40° F)",
					"Duration": "1"
				},
			},
			/*
			Table: Light Frozen Precipitation
			d%		Precipitation	Duration
			1–20	Fog, Light		1d6 hours
			21–40	Fog, Light		1d8 hours
			41–50	Fog, Medium		1d4 hours
			51–60	Snow, Light		1 hour
			61–75	Snow, Light		1d4 hours
			76–100	Snow, Light		2d12 hours
			*/
			"Frozen": {
				20: {
					"Precipitation": "Fog, Light",
					"Duration": "1d6"
				},
				40: {
					"Precipitation": "Fog, Light",
					"Duration": "1d8"
				},
				50: {
					"Precipitation": "Fog, Medium",
					"Duration": "1d4"
				},
				60: {
					"Precipitation": "Snow, Light",
					"Duration": "1"
				},
				75: {
					"Precipitation": "Snow, Light",
					"Duration": "1d4"
				},
				100: {
					"Precipitation": "Snow, Light",
					"Duration": "2d12"
				},
			}
		},
		"Medium": {
			/*
			Table: Medium Unfrozen Precipitation
			d%		Precipitation				Duration
			01–10	Fog, Medium					1d8 hours
			11–20	Fog, Medium					1d12 hours
			21–30	Fog, Heavy					1d4 hours
			31–35	Rain						1d4 hours
			36–70	Rain						1d8 hours
			71–90	Rain						2d12 hours
			91–100	Rain (sleet if below 40° F)	1d4 hours
			*/
			"Unfrozen": {
				10: {
					"Precipitation": "Fog, Medium",
					"Duration": "1d8"
				},
				20: {
					"Precipitation": "Fog, Medium",
					"Duration": "1d12"
				},
				30: {
					"Precipitation": "Fog, Heavy",
					"Duration": "1d4"
				},
				35: {
					"Precipitation": "Rain",
					"Duration": "1d4"
				},
				70: {
					"Precipitation": "Rain",
					"Duration": "1d8"
				},
				90: {
					"Precipitation": "Rain",
					"Duration": "2d12"
				},
				100: {
					"Precipitation": "Rain (sleet if below 40° F)",
					"Duration": "1d4"
				},
			},
			/*
			Table: Medium Frozen Precipitation
			d%	Precipitation	Duration
			1–10	Fog, Medium	1d6 hours
			11–20	Fog, Medium	1d8 hours
			21–30	Fog, Heavy	1d4 hours
			31–50	Snow, Medium	1d4 hours
			51–90	Snow, Medium	1d8 hours
			91–100	Snow, Medium	2d12 hours
			*/
			"Frozen": {
				10: {
					"Precipitation": "Fog, Medium",
					"Duration": "1d6"
				},
				20: {
					"Precipitation": "Fog, Medium",
					"Duration": "1d8"
				},
				30: {
					"Precipitation": "Fog, Heavy",
					"Duration": "1d4"
				},
				50: {
					"Precipitation": "Snow, Medium",
					"Duration": "1d4"
				},
				90: {
					"Precipitation": "Snow, Medium",
					"Duration": "1d8"
				},
				100: {
					"Precipitation": "Snow, Medium",
					"Duration": "2d12"
				},
			}
		},
		"Heavy": {
			/*
			Table: Heavy Unfrozen Precipitation
			d%	Precipitation							Duration
			1–10	Fog, Heavy							1d8 hours
			11–20	Fog, Heavy							2d6 hours
			21–50	Rain, Heavy							1d12 hours
			51–70	Rain, Heavy							2d12 hours
			71–85	Rain, Heavy (sleet if below 40° F)	1d8 hours
			86–90	Thunderstorm						1 hour
			91–100	Thunderstorm						1d3 hours
			*/
			"Unfrozen": {
				10: {
					"Precipitation": "Fog, Heavy",
					"Duration": "1d8"
				},
				20: {
					"Precipitation": "Fog, Heavy",
					"Duration": "2d6"
				},
				50: {
					"Precipitation": "Rain, Heavy",
					"Duration": "1d12"
				},
				70: {
					"Precipitation": "Rain, Heavy",
					"Duration": "2d12"
				},
				85: {
					"Precipitation": "Rain, Heavy (sleet if below 40° F)",
					"Duration": "1d8"
				},
				90: {
					"Precipitation": "Thunderstorm",
					"Duration": "1"
				},
				100: {
					"Precipitation": "Thunderstorm",
					"Duration": "1d3"
				},
			},
			/*
			Table: Heavy Frozen Precipitation
			d%		Precipitation	Duration
			1–10	Fog, Medium		1d8 hours
			11–20	Fog, Heavy		2d6 hours
			21–60	Snow, Light		2d12 hours
			61–90	Snow, Medium		1d8 hours
			91–100	Snow, Heavy		1d6 hours
			*/
			"Frozen": {
				10: {
					"Precipitation": "Fog, Medium",
					"Duration": "1d8"
				},
				20: {
					"Precipitation": "Fog, Heavy",
					"Duration": "2d6"
				},
				60: {
					"Precipitation": "Snow, Light",
					"Duration": "2d12"
				},
				90: {
					"Precipitation": "Snow, Medium",
					"Duration": "1d8"
				},
				100: {
					"Precipitation": "Snow, Heavy",
					"Duration": "1d6"
				},
			}
		},
		"Torrential": {
			/*
			Table: Torrential Unfrozen Precipitation
			d%		Precipitation						Duration
			1–5		Fog, Heavy							1d8 hours
			6–10	Fog, Heavy							2d6 hours
			11–30	Rain, Heavy							2d6 hours
			31–60	Rain, Heavy							2d12 hours
			61–80	Rain, Heavy (sleet if below 40° F)	2d6 hours
			81–95	Thunderstorm						1d3 hours
			96–100	Thunderstorm						1d6 hours
			*/
			"Unfrozen": {
				5: {
					"Precipitation": "Fog, Heavy",
					"Duration": "1d8"
				},
				10: {
					"Precipitation": "Fog, Heavy",
					"Duration": "2d6"
				},
				30: {
					"Precipitation": "Rain, Heavy",
					"Duration": "2d6"
				},
				60: {
					"Precipitation": "Rain, Heavy",
					"Duration": "2d12"
				},
				80: {
					"Precipitation": "Rain, Heavy (sleet if below 40° F)",
					"Duration": "2d6"
				},
				95: {
					"Precipitation": "Thunderstorm",
					"Duration": "1d3"
				},
				100: {
					"Precipitation": "Thunderstorm",
					"Duration": "1d6"
				},
			},
			/*
			Table: Torrential Frozen Precipitation
			d%		Precipitation	Duration
			1–5		Fog, Heavy		1d8 hours
			6–10	Fog, Heavy		2d6 hours
			11–50	Snow, Heavy		1d4 hours
			51–90	Snow, Heavy		1d8 hours
			91–100	Snow, Heavy		2d12 hours
			*/
			"Frozen": {
				5: {
					"Precipitation": "Fog, Heavy",
					"Duration": "1d8"
				},
				10: {
					"Precipitation": "Fog, Heavy",
					"Duration": "2d6"
				},
				50: {
					"Precipitation": "Snow, Heavy",
					"Duration": "1d4"
				},
				90: {
					"Precipitation": "Snow, Heavy",
					"Duration": "1d8"
				},
				100: {
					"Precipitation": "Snow, Heavy",
					"Duration": "2d12"
				},
			}
		}
	},
	
	Main: async function(){
		await pf1Weather.CheckClimate();
	},
	
	Main_SimpleCalendar: async function(){
		if(SimpleCalendar == null){
			ui.notifications.warn("Couldn't locate SimpleCalendar, using standalone method.");
			await pf1Weather.CheckClimate();
		}else{
			await pf1Weather.CheckClimate_SimpleCalendar();
		}
		
	},
	
	RollDie: async function (dice){
		var r = new Roll(dice);
		await r.roll();
		return (r.total);
	},
	
	CheckClimate: async function (){
		
		let content = `<form>
				<select id="climateList">
					<option value="Cold">Cold</option>
					<option value="Temperate">Temperate</option>
					<option value="Tropical">Tropical</option>
				</select>
				<select id="seasonList">
					<option value="Winter">Winter</option>
					<option value="Spring">Spring</option>
					<option value="Summer">Summer</option>
					<option value="Fall">Fall</option>
				</select>
				<select id="elevationList">
					<option value="Sea level">Sea level(Below 1,000 ft.)</option>
					<option value="Lowland">Lowland (1,000 ft. to 5,000 ft.)</option>
					<option value="Highland">Highland (Above 5,000 ft.)</option>
				</select>
			</form>`;
		if(game.system.gridUnits != "ft"){
			content = content.replaceAll("1,000 ft.","305 m.");
			content = content.replaceAll("5,000 ft.","1524 m.");
		}
		new Dialog({
			title: "Weather",
			content: content, 
			buttons : { OK : {label : `Ok`, callback : async (html) => { pf1Weather.WeatherRolls(html.find('#climateList').val(),html.find('#seasonList').val(),html.find('#elevationList').val())} } }
		}).render(true);
		
	},
	
	CheckClimate_SimpleCalendar: async function (){
		
		let content = `<form>
				<select id="climateList">
					<option value="Cold">Cold</option>
					<option value="Temperate">Temperate</option>
					<option value="Tropical">Tropical</option>
				</select>
				<select id="seasonList">
					<option value="Winter">Winter</option>
					<option value="Spring">Spring</option>
					<option value="Summer">Summer</option>
					<option value="Fall">Fall</option>
				</select>
				<select id="elevationList">
					<option value="Sea level">Sea level(Below 1,000 ft.)</option>
					<option value="Lowland">Lowland (1,000 ft. to 5,000 ft.)</option>
					<option value="Highland">Highland (Above 5,000 ft.)</option>
				</select>
			</form>`;
		new Dialog({
			title: "Weather",
			content: content, 
			buttons : { OK : {label : `Ok`, callback : async (html) => { pf1Weather.SimpleCalendarWeatherRolls(html.find('#climateList').val(),html.find('#seasonList').val(),html.find('#elevationList').val())} } }
		}).render(true);
		
	},

	WeatherRolls: async function (climate, season, elevation){
		game.user.setFlag("pf1-weather","climate",climate);
		game.user.setFlag("pf1-weather","season",season);
		game.user.setFlag("pf1-weather","elevation",elevation);
		pf1Weather.theClimate = climate;
		pf1Weather.theSeason = season;
		pf1Weather.baselineTemp = pf1Weather.ClimateBaselines[climate][season];
		let ClimateVar = await pf1Weather.GetClimateVariation(climate);
		let theTemp = pf1Weather.baselineTemp + pf1Weather.ElevationModifiers[elevation]["Temp Mod"] + ClimateVar[0];
		let percipitation = pf1Weather.SeasonalPercipitationBaselines[season][climate] + pf1Weather.ClimateBaselines[climate]["Percip Freq Mod"] + pf1Weather.ElevationModifiers[elevation]["Percip Freq Mod"];
		if(percipitation < 0){
			percipitation = 0;
		}else if(percipitation > 4){
			percipitation = 4;
		}
		let WeatherMessage = "<h3 class='WeatherMessage'>" + climate + " climate in " + season + " at " + elevation + "</h3>" + "The temperature is <b>" + theTemp + "° F</b> for the next " + ClimateVar[1] + " days ";
		var everPercip = false;
		for(var day = 1; day <= ClimateVar[1]; day++){
			WeatherMessage += "<div style='border:1px solid #b3b3b3;'><h3>Day " + day + "</h3>"
			var percipRoll = await pf1Weather.RollDie("1d100");
			let cloudCover = await pf1Weather.GetCloudCoverData();
			
			//WeatherMessage += "Cloud Cover: " + cloudCover + "<br>";
			if(percipRoll <= pf1Weather.PrecipitationChances[pf1Weather.PercipitationFrequency[percipitation]]["chance"]){
				everPercip = true;
				let percipIntensity = pf1Weather.ElevationModifiers[elevation]["Percip Baseline"] + pf1Weather.ClimateBaselines[climate]["Percip Inten Mod"];
				let percipOptions;
				
				//start time 1d12 1d6 a.m./p.m.
				let startTime = (await pf1Weather.RollDie("1d12")) + (await pf1Weather.RollDie("1d6") < 4 ? " a.m." : " p.m.");
				
				//Set percipOptions based on if theTemp is in the Freezing range
				if(theTemp <= 32){
					percipOptions = pf1Weather.PercipitationTables[pf1Weather.PercipitationIntensity[percipIntensity]]["Frozen"];
				}else{
					percipOptions = pf1Weather.PercipitationTables[pf1Weather.PercipitationIntensity[percipIntensity]]["Unfrozen"];
				}
				
				//Roll for what kind of Precipitation and Duration for this day
				var percipRoll2 = await pf1Weather.RollDie("1d100");
				for(let key of Object.keys(percipOptions)){
					if(percipRoll2 <= key){
						var percipDuration = await pf1Weather.RollDie(percipOptions[key]["Duration"]);
						
						var pack = game.packs.get("pf1-weather.weather-buffs");
						let buffs = [];
						pack.index.forEach(template => buffs.push({name: template.name,id: template._id}));
						let weatherName = percipOptions[key]["Precipitation"];
						if(buffs.filter(buff => buff.name == weatherName).length > 0){
							let weatherCompendium = buffs.filter(buff => buff.name == weatherName)[0].id;
							WeatherMessage += `@Compendium[pf1-weather.weather-buffs.${weatherCompendium}]{${weatherName}}` + " will start at " + startTime + " and will last for " + percipDuration + " hours.<br>";
						}else{
							WeatherMessage += weatherName + " will start at " + startTime + " and will last for " + percipDuration + " hours.<br>";
						}
						WeatherMessage += "Cloud Cover: Overcast<br>";
						let Wind = await pf1Weather.GetWindData();
						let windCompendium = buffs.filter(buff => buff.name == Wind.WindStrength);
						if((weatherName === "Fog, Heavy" || weatherName === "Fog, Medium" || weatherName === "Fog, Light") && Wind.WindStrength === "Light"){
							WeatherMessage += "Wind: " + ( windCompendium.length > 0 ? `@Compendium[pf1-weather.weather-buffs.${windCompendium[0].id}]{${Wind.WindStrength}}` : Wind.WindStrength) + " (" + Wind.WindSpeed + ")<br>";
							WeatherMessage += (Wind.RangedWeaponPenalty > 0 ? "Ranged Weapon Penalty: " + Wind.RangedWeaponPenalty + "<br>" : "");
							WeatherMessage += (Wind.SiegeWeaponPenalty > 0 ? "Siege Weapon Penalty: " + Wind.SiegeWeaponPenalty + "<br>" : "");
							WeatherMessage += (Wind.CheckSize != "" ? "Check Size: " + Wind.CheckSize + "<br>" : "");
							WeatherMessage += (Wind.BlownAwaySize != "" ? "Blown Away Size: " + Wind.BlownAwaySize + "<br>" : "");
							WeatherMessage += (Wind.SkillPenalty > 0 ? "Skill Penalty: " + Wind.SkillPenalty + "<br>" : "");
						}else{
							WeatherMessage += "Wind: " + ( windCompendium.length > 0 ? `@Compendium[pf1-weather.weather-buffs.${windCompendium[0].id}]{${Wind.WindStrength}}` : Wind.WindStrength) + " (" + Wind.WindSpeed + ")<br>";
							WeatherMessage += (Wind.RangedWeaponPenalty > 0 ? "Ranged Weapon Penalty: " + Wind.RangedWeaponPenalty + "<br>" : "");
							WeatherMessage += (Wind.SiegeWeaponPenalty > 0 ? "Siege Weapon Penalty: " + Wind.SiegeWeaponPenalty + "<br>" : "");
							WeatherMessage += (Wind.CheckSize != "" ? "Check Size: " + Wind.CheckSize + "<br>" : "");
							WeatherMessage += (Wind.BlownAwaySize != "" ? "Blown Away Size: " + Wind.BlownAwaySize + "<br>" : "");
							WeatherMessage += (Wind.SkillPenalty > 0 ? "Skill Penalty: " + Wind.SkillPenalty + "<br>" : "");
						}
						
						break;
					}
				}
			}else{
				//No Precipitation so Clear Skies WOOHOO
				WeatherMessage += "Skies will be clear on day " + day + "<br>";
				WeatherMessage += "Cloud Cover: " + cloudCover + "<br>";
				if(cloudCover === "Overcast"){
					WeatherMessage += "Overcast conditions grant concealment for creatures flying at high altitudes.<br>";
					if(season == "Fall" || season == "Winter"){
						WeatherMessage += "Temperature is 10° F higher today.<br>";
					}else if(season == "Spring" || season == "Summer"){
						WeatherMessage += "Temperature is 10° F lower today.<br>";
					}
					
				}
				let Wind = await pf1Weather.GetWindData();
				var pack = game.packs.get("pf1-weather.weather-buffs");
				let buffs = [];
				pack.index.forEach(template => buffs.push({name: template.name,id: template._id}));
				let windCompendium = buffs.filter(buff => buff.name == Wind.WindStrength);
				WeatherMessage += "Wind: " + ( windCompendium.length > 0 ? `@Compendium[pf1-weather.weather-buffs.${windCompendium[0].id}]{${Wind.WindStrength}}` : Wind.WindStrength) + " (" + Wind.WindSpeed + ")<br>";
				WeatherMessage += (Wind.RangedWeaponPenalty > 0 ? "Ranged Weapon Penalty: " + Wind.RangedWeaponPenalty + "<br>" : "");
				WeatherMessage += (Wind.SiegeWeaponPenalty > 0 ? "Siege Weapon Penalty: " + Wind.SiegeWeaponPenalty + "<br>" : "");
				WeatherMessage += (Wind.CheckSize != "" ? "Check Size: " + Wind.CheckSize + "<br>" : "");
				WeatherMessage += (Wind.BlownAwaySize != "" ? "Blown Away Size: " + Wind.BlownAwaySize + "<br>" : "");
				WeatherMessage += (Wind.SkillPenalty > 0 ? "Skill Penalty: " + Wind.SkillPenalty + "<br>" : "");
			}
			WeatherMessage += "</div>";
		}
		//Add Compendium Journals to end of the message
		var pack = game.packs.get("pf1-weather.pf1-weather-journals");
		let journals = [];
		pack.index.forEach(template => journals.push({name: template.name,id: template._id}));
		
		everPercip ? WeatherMessage += `<br>@Compendium[pf1-weather.pf1-weather-journals.${journals.filter(journal => journal.name == "Precipitation Weather Rules")[0].id}]{Precipitation Weather Rules}` : console.log("No rules needed");
		//console.log(WeatherMessage);
		if(game.system.gridUnits == "m"){
			WeatherMessage = WeatherMessage.replaceAll(theTemp + "° F", Math.floor((theTemp - 32) * 5 / 9) + "° C");
		}
		let chatData = {
		   user: game.user.id,
		   speaker: {
			  alias: "Weather Report"
		   },
		   content: WeatherMessage,
		   whisper : ChatMessage.getWhisperRecipients("Gamemaster")
		};
		ChatMessage.create(chatData, {});
		
	},

	ViewLastWeatherRoll: function (){
		let chatData = {
				user: game.user.id,
				speaker: {
					alias: "Weather Report"
				},
				content: document.querySelectorAll(".WeatherMessage")[document.querySelectorAll(".WeatherMessage").length - 1].parentElement.innerHTML,
				whisper : ChatMessage.getWhisperRecipients("Gamemaster")
			};
			ChatMessage.create(chatData, {});
		
	},

	GetClimateVariation: async function (climate){
		let r = await pf1Weather.RollDie("1d100");
		for(let key of Object.keys(pf1Weather.ClimateVariations[climate])){
			if(r <= key){
				let obj = [0, 0];
				await pf1Weather.RollDie(pf1Weather.ClimateVariations[climate][key]["Variation"]).then((response) => {obj[0] = pf1Weather.ClimateVariations[climate][key]["Multiplier"] * response});
				await pf1Weather.RollDie(pf1Weather.ClimateVariations[climate][key]["Duration"]).then((response) => {obj[1] = response});
				return obj;
			}
		}
	},

	GetWindData: async function (){
		let roll = await pf1Weather.RollDie("1d100");
		for(let key of Object.keys(pf1Weather.WindData)){
			if(roll <= key){
				return pf1Weather.WindData[key];
			}
		}
	},
	
	GetCloudCoverData: async function (){
		let roll = await pf1Weather.RollDie("1d100");
		for(let key of Object.keys(pf1Weather.CloudCoverData)){
			if(roll <= key){
				return pf1Weather.CloudCoverData[key];
			}
		}
	},
	
	SimpleCalendarWeatherRolls: async function (climate, season, elevation){
		game.user.setFlag("pf1-weather","climate",climate);
		game.user.setFlag("pf1-weather","season",season);
		game.user.setFlag("pf1-weather","elevation",elevation);
		pf1Weather.theClimate = climate;
		pf1Weather.theSeason = season;
		pf1Weather.baselineTemp = pf1Weather.ClimateBaselines[climate][season];
		let ClimateVar = await pf1Weather.GetClimateVariation(climate);
		let theTemp = pf1Weather.baselineTemp + pf1Weather.ElevationModifiers[elevation]["Temp Mod"] + ClimateVar[0];
		let percipitation = pf1Weather.SeasonalPercipitationBaselines[season][climate] + pf1Weather.ClimateBaselines[climate]["Percip Freq Mod"] + pf1Weather.ElevationModifiers[elevation]["Percip Freq Mod"];
		if(percipitation < 0){
			percipitation = 0;
		}else if(percipitation > 4){
			percipitation = 4;
		}
		
		
		console.log(SimpleCalendar.api.getCurrentDay().numericRepresentation + ":" + (SimpleCalendar.api.getCurrentDay().numericRepresentation + ClimateVar[1]));
		for(var day = SimpleCalendar.api.getCurrentDay().numericRepresentation; day <= SimpleCalendar.api.getCurrentDay().numericRepresentation + ClimateVar[1]; day++){
			var everPercip = false;
			let WeatherMessage = "<h3 class='WeatherMessage'>" + climate + " climate in " + season + " at " + elevation + "</h3>" + "The temperature is <b>" + theTemp + "° F</b><br>";
			//WeatherMessage += "<div style='border:1px solid #b3b3b3;'><h3>Day " + day + "</h3>"
			var percipRoll = await pf1Weather.RollDie("1d100");
			let cloudCover = await pf1Weather.GetCloudCoverData();
			
			//WeatherMessage += "Cloud Cover: " + cloudCover + "<br>";
			if(percipRoll <= pf1Weather.PrecipitationChances[pf1Weather.PercipitationFrequency[percipitation]]["chance"]){
				everPercip = true;
				let percipIntensity = pf1Weather.ElevationModifiers[elevation]["Percip Baseline"] + pf1Weather.ClimateBaselines[climate]["Percip Inten Mod"];
				let percipOptions;
				
				//start time 1d12 1d6 a.m./p.m.
				let startTime = (await pf1Weather.RollDie("1d12")) + (await pf1Weather.RollDie("1d6") < 4 ? " a.m." : " p.m.");
				
				//Set percipOptions based on if theTemp is in the Freezing range
				if(theTemp <= 32){
					percipOptions = pf1Weather.PercipitationTables[pf1Weather.PercipitationIntensity[percipIntensity]]["Frozen"];
				}else{
					percipOptions = pf1Weather.PercipitationTables[pf1Weather.PercipitationIntensity[percipIntensity]]["Unfrozen"];
				}
				
				//Roll for what kind of Precipitation and Duration for this day
				var percipRoll2 = await pf1Weather.RollDie("1d100");
				for(let key of Object.keys(percipOptions)){
					if(percipRoll2 <= key){
						var percipDuration = await pf1Weather.RollDie(percipOptions[key]["Duration"]);
						
						var pack = game.packs.get("pf1-weather.weather-buffs");
						let buffs = [];
						pack.index.forEach(template => buffs.push({name: template.name,id: template._id}));
						let weatherName = percipOptions[key]["Precipitation"];
						if(buffs.filter(buff => buff.name == weatherName).length > 0){
							let weatherCompendium = buffs.filter(buff => buff.name == weatherName)[0].id;
							WeatherMessage += `@Compendium[pf1-weather.weather-buffs.${weatherCompendium}]{${weatherName}}` + " will start at " + startTime + " and will last for " + percipDuration + " hours.<br>";
						}else{
							WeatherMessage += weatherName + " will start at " + startTime + " and will last for " + percipDuration + " hours.<br>";
						}
						WeatherMessage += "Cloud Cover: Overcast<br>";
						let Wind = await pf1Weather.GetWindData();
						let windCompendium = buffs.filter(buff => buff.name == Wind.WindStrength);
						if((weatherName === "Fog, Heavy" || weatherName === "Fog, Medium" || weatherName === "Fog, Light") && Wind.WindStrength === "Light"){
							WeatherMessage += "Wind: " + ( windCompendium.length > 0 ? `@Compendium[pf1-weather.weather-buffs.${windCompendium[0].id}]{${Wind.WindStrength}}` : Wind.WindStrength) + " (" + Wind.WindSpeed + ")<br>";
							WeatherMessage += (Wind.RangedWeaponPenalty > 0 ? "Ranged Weapon Penalty: " + Wind.RangedWeaponPenalty + "<br>" : "");
							WeatherMessage += (Wind.SiegeWeaponPenalty > 0 ? "Siege Weapon Penalty: " + Wind.SiegeWeaponPenalty + "<br>" : "");
							WeatherMessage += (Wind.CheckSize != "" ? "Check Size: " + Wind.CheckSize + "<br>" : "");
							WeatherMessage += (Wind.BlownAwaySize != "" ? "Blown Away Size: " + Wind.BlownAwaySize + "<br>" : "");
							WeatherMessage += (Wind.SkillPenalty > 0 ? "Skill Penalty: " + Wind.SkillPenalty + "<br>" : "");
						}else{
							WeatherMessage += "Wind: " + ( windCompendium.length > 0 ? `@Compendium[pf1-weather.weather-buffs.${windCompendium[0].id}]{${Wind.WindStrength}}` : Wind.WindStrength) + " (" + Wind.WindSpeed + ")<br>";
							WeatherMessage += (Wind.RangedWeaponPenalty > 0 ? "Ranged Weapon Penalty: " + Wind.RangedWeaponPenalty + "<br>" : "");
							WeatherMessage += (Wind.SiegeWeaponPenalty > 0 ? "Siege Weapon Penalty: " + Wind.SiegeWeaponPenalty + "<br>" : "");
							WeatherMessage += (Wind.CheckSize != "" ? "Check Size: " + Wind.CheckSize + "<br>" : "");
							WeatherMessage += (Wind.BlownAwaySize != "" ? "Blown Away Size: " + Wind.BlownAwaySize + "<br>" : "");
							WeatherMessage += (Wind.SkillPenalty > 0 ? "Skill Penalty: " + Wind.SkillPenalty + "<br>" : "");
						}
						
						break;
					}
				}
			}else{
				//No Precipitation so Clear Skies WOOHOO
				WeatherMessage += "No precipitation today<br>";
				WeatherMessage += "Cloud Cover: " + cloudCover + "<br>";
				if(cloudCover === "Overcast"){
					WeatherMessage += "Overcast conditions grant concealment for creatures flying at high altitudes.<br>";
					if(season == "Fall" || season == "Winter"){
						WeatherMessage = WeatherMessage.replace(theTemp + "°", (theTemp + 10) + "°")
						//WeatherMessage += "Temperature is 10° F higher today.<br>";
					}else if(season == "Spring" || season == "Summer"){
						WeatherMessage = WeatherMessage.replace(theTemp + "°", (theTemp - 10) + "°")
						//WeatherMessage += "Temperature is 10° F lower today.<br>";
					}
					
				}
				let Wind = await pf1Weather.GetWindData();
				var pack = game.packs.get("pf1-weather.weather-buffs");
				let buffs = [];
				pack.index.forEach(template => buffs.push({name: template.name,id: template._id}));
				let windCompendium = buffs.filter(buff => buff.name == Wind.WindStrength);
				WeatherMessage += "Wind: " + ( windCompendium.length > 0 ? `@Compendium[pf1-weather.weather-buffs.${windCompendium[0].id}]{${Wind.WindStrength}}` : Wind.WindStrength) + " (" + Wind.WindSpeed + ")<br>";
				WeatherMessage += (Wind.RangedWeaponPenalty > 0 ? "Ranged Weapon Penalty: " + Wind.RangedWeaponPenalty + "<br>" : "");
				WeatherMessage += (Wind.SiegeWeaponPenalty > 0 ? "Siege Weapon Penalty: " + Wind.SiegeWeaponPenalty + "<br>" : "");
				WeatherMessage += (Wind.CheckSize != "" ? "Check Size: " + Wind.CheckSize + "<br>" : "");
				WeatherMessage += (Wind.BlownAwaySize != "" ? "Blown Away Size: " + Wind.BlownAwaySize + "<br>" : "");
				WeatherMessage += (Wind.SkillPenalty > 0 ? "Skill Penalty: " + Wind.SkillPenalty + "<br>" : "");
			}
			WeatherMessage += "</div>";
			//Add Compendium Journals to end of the message
			var pack = game.packs.get("pf1-weather.pf1-weather-journals");
			let journals = [];
			pack.index.forEach(template => journals.push({name: template.name,id: template._id}));
			everPercip ? WeatherMessage += `<br>@Compendium[pf1-weather.pf1-weather-journals.${journals.filter(journal => journal.name == "Precipitation Weather Rules")[0].id}]{Precipitation Weather Rules}` : console.log("No rules needed");
			let theDate = pf1Weather.GetDateForNote({
				year: (SimpleCalendar.api.getCurrentYear().numericRepresentation),
				month: (SimpleCalendar.api.getCurrentMonth().numericRepresentation-1),
				day: day-1,
				hour: 0,
				minute: 0,
				seconds: 0
			});
			if(game.system.gridUnits == "m"){
				WeatherMessage = WeatherMessage.replaceAll(theTemp + "° F", Math.floor((theTemp - 32) * 5 / 9) + "° C");
			}
			const newJournal = await SimpleCalendar.api.addNote('Weather Report', WeatherMessage, theDate, theDate, true, SimpleCalendar.api.NoteRepeat.Never, ['Weather Report']);
			console.log(newJournal);
		}
		
		
		
		//console.log(WeatherMessage);
		
		/*let chatData = {
		   user: game.user.id,
		   speaker: {
			  alias: "Weather Report"
		   },
		   content: WeatherMessage,
		   whisper : ChatMessage.getWhisperRecipients("Gamemaster")
		};
		ChatMessage.create(chatData, {});*/
		
	},
	
	GetDateForNote: function (date) {
		console.log("Before: ", date);
		let year = date.year;
		let month = date.month;
		let day = date.day;
		if(day > SimpleCalendar.api.getCurrentMonth().numberOfDays - 1){
			date = {
				year: year,
				month: month+1,
				day: day - SimpleCalendar.api.getCurrentMonth().numberOfDays,
				hour: 0,
				minute: 0,
				seconds: 0
			};
			if(month+1 > SimpleCalendar.api.getCurrentCalendar().months.length-1){
				date = {
					year: year+1,
					month: 0,
					day: day - SimpleCalendar.api.getCurrentMonth().numberOfDays,
					hour: 0,
					minute: 0,
					seconds: 0
				}
			}
		}
		console.log("After: ", date);
		return date;
	},

	RemoveCurrentAndFutureWeatherReports: async function (){
		pf1Weather.RemoveCurrentWeatherReport();
		pf1Weather.RemoveFutureWeatherReports();
	},
	
	RemoveCurrentWeatherReport: async function (){
		let notes = SimpleCalendar.api.searchNotes("Weather Report").filter(entry => pf1Weather.isDate(entry, SimpleCalendar.api.getCurrentYear().numericRepresentation, SimpleCalendar.api.getCurrentMonth().numericRepresentation - 1, SimpleCalendar.api.getCurrentDay().numericRepresentation - 1));
		for(let note of notes){
			SimpleCalendar.api.removeNote(note["_id"]);
		}
	},
	
	RemoveFutureWeatherReports: async function (){
		let notes = SimpleCalendar.api.searchNotes("Weather Report").filter(entry => pf1Weather.isAfterDate(entry, SimpleCalendar.api.getCurrentYear().numericRepresentation, SimpleCalendar.api.getCurrentMonth().numericRepresentation - 1, SimpleCalendar.api.getCurrentDay().numericRepresentation - 1));
		for(let note of notes){
			SimpleCalendar.api.removeNote(note["_id"]);
		}
	},
	
	RemoveAllWeatherReports: async function (){
		let notes = SimpleCalendar.api.searchNotes("Weather Report");
		for(let note of notes){
			SimpleCalendar.api.removeNote(note["_id"]);
		}
	},
	
	isEqualOrAfterDate: function (entry, compYear, compMonth, compDay){
		let entryDate = new Date(entry.flags["foundryvtt-simple-calendar"].noteData.startDate.year +"-" + (entry.flags["foundryvtt-simple-calendar"].noteData.startDate.month + 1) + "-" + (entry.flags["foundryvtt-simple-calendar"].noteData.startDate.day + 1)).getTime();
		let compDate = new Date(compYear + "-" + (compMonth + 1) + "-" + (compDay + 1)).getTime();
		console.log(entry.flags["foundryvtt-simple-calendar"].noteData.startDate);
		console.log(entry.flags["foundryvtt-simple-calendar"].noteData.startDate.year +"-" + (entry.flags["foundryvtt-simple-calendar"].noteData.startDate.month + 1) + "-" + (entry.flags["foundryvtt-simple-calendar"].noteData.startDate.day + 1));
		console.log("Entry Date: " + entryDate + "\nComp Date: " + compDate);
		return entryDate >= compDate;
	},
	
	isAfterDate: function (entry, compYear, compMonth, compDay){
		let entryDate = new Date(entry.flags["foundryvtt-simple-calendar"].noteData.startDate.year +"-" + (entry.flags["foundryvtt-simple-calendar"].noteData.startDate.month + 1) + "-" + (entry.flags["foundryvtt-simple-calendar"].noteData.startDate.day + 1)).getTime();
		let compDate = new Date(compYear + "-" + (compMonth + 1) + "-" + (compDay + 1)).getTime();
		console.log(entry.flags["foundryvtt-simple-calendar"].noteData.startDate);
		console.log(entry.flags["foundryvtt-simple-calendar"].noteData.startDate.year +"-" + (entry.flags["foundryvtt-simple-calendar"].noteData.startDate.month + 1) + "-" + (entry.flags["foundryvtt-simple-calendar"].noteData.startDate.day + 1));
		console.log("Entry Date: " + entryDate + "\nComp Date: " + compDate);
		return entryDate > compDate;
	},
	
	isDate: function (entry, compYear, compMonth, compDay){
		let entryDate = new Date(entry.flags["foundryvtt-simple-calendar"].noteData.startDate.year +"-" + (entry.flags["foundryvtt-simple-calendar"].noteData.startDate.month + 1) + "-" + (entry.flags["foundryvtt-simple-calendar"].noteData.startDate.day + 1)).getTime();
		let compDate = new Date(compYear + "-" + (compMonth + 1) + "-" + (compDay + 1)).getTime();
		return entryDate == compDate;
	},
	
	OutputCurrentWeatherToWhisper: function(){
		let notes = SimpleCalendar.api.searchNotes("Weather Report");
		let note = notes.filter(x => x.flags["foundryvtt-simple-calendar"].noteData.startDate.year == SimpleCalendar.api.currentDateTime().year && x.flags["foundryvtt-simple-calendar"].noteData.startDate.month == SimpleCalendar.api.currentDateTime().month && x.flags["foundryvtt-simple-calendar"].noteData.startDate.day == SimpleCalendar.api.currentDateTime().day);
		if(note.length >= 1){
			let messageData = "";
			for(theNote of note){
				messageData += theNote.pages.contents[0].text.content;
			}
			let chatData = {
			   user: game.user.id,
			   speaker: {
				  alias: "Weather Report"
			   },
			   content: messageData,
			   whisper: game.users.filter(x => x.isGM).map(x => x.id)
			};
			ChatMessage.create(chatData, {});
		}else{
			ui.notifications.error("No Weather Report today to output to chat.");
		}
	},
	
	OutputCurrentWeatherToChat: function(){
		let notes = SimpleCalendar.api.searchNotes("Weather Report");
		let note = notes.filter(x => x.flags["foundryvtt-simple-calendar"].noteData.startDate.year == SimpleCalendar.api.currentDateTime().year && x.flags["foundryvtt-simple-calendar"].noteData.startDate.month == SimpleCalendar.api.currentDateTime().month && x.flags["foundryvtt-simple-calendar"].noteData.startDate.day == SimpleCalendar.api.currentDateTime().day);
		if(note.length >= 1){
			let messageData = "";
			for(theNote of note){
				messageData += theNote.pages.contents[0].text.content;
			}
			let chatData = {
			   user: game.user.id,
			   speaker: {
				  alias: "Weather Report"
			   },
			   content: messageData
			};
			ChatMessage.create(chatData, {});
		}else{
			ui.notifications.error("No Weather Report today to output to chat.");
		}
	}
}

Hooks.on("renderApplication", (dialog, html, data) => {
	//console.log("dialog",dialog);
	if(dialog.data != null && dialog.data.title == "Weather"){
		let climate = game.user.getFlag("pf1-weather","climate");
		let season = game.user.getFlag("pf1-weather","season");
		let elevation = game.user.getFlag("pf1-weather","elevation");
		document.querySelector("#climateList").value = climate;
		document.querySelector("#seasonList").value = season;
		document.querySelector("#elevationList").value = elevation;
	}
});

// Adding a button that will generate weather reports into SimpleCalendar when clicked
Hooks.once("renderApplication", () =>{
	if(SimpleCalendar != null){
		// Adding a button that should show a side panel
		if(game.user.isGM){
			SimpleCalendar.api.addSidebarButton("PF1 Weather", "fa-solid fa-cloud", "pf1-weather-panel-class", true, populateSidePanel);
		}
	}
})

// Function to call to populate the side panel
function populateSidePanel(event, element){
	for(let i = element.children.length-1; i > -1; i--){
		element.removeChild(element.children[i]);
	}
    if(element){
		let prevClimate = game.user.getFlag("pf1-weather","climate");
		let prevSeason = game.user.getFlag("pf1-weather","season");
		let prevElevation = game.user.getFlag("pf1-weather","elevation");
		
		
		const header = document.createElement('h2');
		header.innerText = "PF1 Weather";
		element.append(header);
		
		let dateHeader = document.createElement('h3');
		dateHeader.innerText = `Current Date: ${SimpleCalendar.api.currentDateTimeDisplay().date}`;
		element.append(dateHeader);
	   
		let seasons = SimpleCalendar.api.getAllSeasons().map(x => x.name);
		let curSeason = SimpleCalendar.api.getCurrentSeason().name;
		let formElement = document.createElement("form");
		
		let climateSelect = document.createElement("select");
		climateSelect.id = "climateList-SC";
		let coldOption = document.createElement("option");
		coldOption.value = "Cold";
		coldOption.innerText = "Cold";
		climateSelect.appendChild(coldOption);
		let tempOption = document.createElement("option");
		tempOption.value = "Temperate";
		tempOption.innerText = "Temperate";
		climateSelect.appendChild(tempOption);
		let tropOption = document.createElement("option");
		tropOption.value = "Tropical";
		tropOption.innerText = "Tropical";
		climateSelect.appendChild(tropOption);
		climateSelect.value = prevClimate;
		formElement.appendChild(climateSelect);
		
		let seasonSelect = document.createElement("select");
		seasonSelect.id = "seasonList-SC";
		for(let season of seasons){
			let optionElement = document.createElement("option");
			optionElement.value = season;
			optionElement.innerText = season;
			seasonSelect.appendChild(optionElement);
		}
		seasonSelect.value = curSeason;
		formElement.appendChild(seasonSelect);
		
		let elevationSelect = document.createElement("select");
		elevationSelect.id = "elevationList-SC";
		let seaOpt = document.createElement("option");
		seaOpt.value = "Sea level";
		seaOpt.innerText = "Sea level(Below " + (game.system.gridUnits == "ft" ? "1,000 ft." : "305 m.") + ")";
		elevationSelect.appendChild(seaOpt);
		let lowOpt = document.createElement("option");
		lowOpt.value = "Lowland";
		lowOpt.innerText = "Lowland (" + (game.system.gridUnits == "ft" ? "1,000 ft." : "305 m.") + " to " + (game.system.gridUnits == "ft" ? "5,000 ft." : "1524 m.") + ")";
		elevationSelect.appendChild(lowOpt);
		let highOp = document.createElement("option");
		highOp.value = "Highland";
		highOp.innerText = "Highland (Above " + (game.system.gridUnits == "ft" ? "5,000 ft." : "1524 m.") + ")";
		elevationSelect.appendChild(highOp);
		elevationSelect.value = prevElevation;
		formElement.appendChild(elevationSelect);
		
		element.append(formElement);
		let buttons = document.createElement("div");
		//I did all the nonsense above then realized I could have done it this way from the begining... decided it didn't need to be changed above.
		buttons.innerHTML = `
			<button id='pf1-weather-roll' class='fsc-xb fsc-kf fsc-lf pf1-weather-button' onclick="pf1Weather.SimpleCalendarWeatherRolls(document.querySelector('#climateList-SC').value,document.querySelector('#seasonList-SC').value,document.querySelector('#elevationList-SC').value)">Roll Weather</button>
			<button id='pf1-weather-rem-today' class='fsc-xb fsc-kf fsc-lf pf1-weather-button' onclick="pf1Weather.RemoveCurrentWeatherReport()">Remove Todays Weather Report</button>
			<button id='pf1-weather-rem-fut' class='fsc-xb fsc-kf fsc-lf pf1-weather-button' onclick="pf1Weather.RemoveFutureWeatherReports()">Remove All Future Weather Reports</button>
			<button id='pf1-weather-rem-fut' class='fsc-xb fsc-kf fsc-lf pf1-weather-button' onclick="pf1Weather.RemoveCurrentAndFutureWeatherReports()">Remove Today's and All Future Weather Reports</button>
			<button id='pf1-weather-to-chat' class='fsc-xb fsc-kf fsc-lf pf1-weather-button' onclick="pf1Weather.OutputCurrentWeatherToChat()">Output Today's Weather to Chat</button>
			<button id='pf1-weather-to-gm' class='fsc-xb fsc-kf fsc-lf pf1-weather-button' onclick="pf1Weather.OutputCurrentWeatherToWhisper()">Whisper Today's Weather to GM</button>
		`;
		
		element.append(buttons);
	}
}
