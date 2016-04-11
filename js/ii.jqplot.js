
(function(spqlib, $) {

	var c = [];
	
	spqlib.jqplot = (function(){
		
		/*COMUNI*/
		var PROP_CHART_TITLE = "chart.title";
		/*BARCHART*/
		var PROP_CHART_BAR_WIDTH = "chart.bar.width";
		var PROP_CHART_BAR_MARGIN = "chart.bar.margin";
		var PROP_CHART_BAR_PADDING = "chart.bar.padding";
		var PROP_CHART_AXIS_X_LABEL = "chart.axis.x.label";
		var PROP_CHART_AXIS_Y_LABEL = "chart.axis.y.label";
		var PROP_CHART_AXIS_X_LABEL_FONT_SIZE = "chart.axis.x.label.font.size";
		var PROP_CHART_AXIS_Y_LABEL_FONT_SIZE = "chart.axis.x.label.font.size";
		var PROP_CHART_AXIS_X_FONT_SIZE = "chart.axis.x.font.size";
		var PROP_CHART_AXIS_Y_FONT_SIZE = "chart.axis.x.font.size";
		var PROP_CHART_DIRECTION = "chart.direction";
		var PROP_CHART_LEGEND_SHOW = "chart.legend.show";
		var PROP_CHART_LEGEND_LOCATION = "chart.legend.location";
		var PROP_CHART_AXIS_X_ANGLE = "chart.axis.x.angle";
		var PROP_CHART_AXIS_Y_ANGLE = "chart.axis.y.angle";
		/*BUBBLE CHART*/
		var PROP_CHART_LEGEND_COLUMN_ASSET = "chart.legend.column.asset";
		var PROP_CHART_LEGEND_COLUMN_RADIUS = "chart.legend.column.radius";
		var PROP_CHART_TOOLTIP_LABEL_PATTERN = "chart.tooltip.asset.label.pattern";
		var PROP_CHART_TOOLTIP_LABEL_LINK_SHOW = "chart.tooltip.asset.link.show";
		var PROP_CHART_TOOLTIP_LABEL_LINK_PATTERN = "chart.tooltip.asset.label.link.pattern";
		var PROP_CHART_TOOLTIP_X_LABEL = "chart.tooltip.x.label";
		var PROP_CHART_TOOLTIP_Y_LABEL = "chart.tooltip.y.label";
		var PROP_CHART_TOOLTIP_R_LABEL = "chart.tooltip.r.label";
		var PROP_CHART_TOOLTIP_X_VALUE_PATTERN = "chart.tooltip.x.value.pattern";
		var PROP_CHART_TOOLTIP_Y_VALUE_PATTERN = "chart.tooltip.y.value.pattern";
		var PROP_CHART_TOOLTIP_R_VALUE_PATTERN = "chart.tooltip.r.value.pattern";
		
		
		var colorscheme = {
			0:    [ '#1f77b4', '#aec7e8', '#ff7f0e', '#ffbb78', '#2ca02c', '#98df8a', '#d62728', '#ff9896', '#9467bd', '#c5b0d5', '#8c564b', '#c49c94', '#e377c2', '#f7b6d2', '#7f7f7f', '#c7c7c7', '#bcbd22', '#dbdb8d', '#17becf', '#9edae5' ] ,
			cc124:{9: [ '#E8D0A9', '#B7AFA3', '#C1DAD6', '#F5FAFA', '#ACD1E9', '#6D929B' ] },
			cc128:{9: [ '#7D9C9F', '#BDD8DA', '#DFEFF0', '#AD235E', '#ECECEC', '#B1B1B1' ] },
			cc129:{9: [ '#6194BC', '#A5D1F3', '#D0EAFF', '#E4001B', '#ECECEC', '#606060' ] },
			cc173:{9: [ '#206BA4', '#BBD9EE', '#EBF4FA', '#C0C0C0', '#E7E4D3', '#F1EFE2' ] },
			cc210:{9: [ '#660F57', '#663366', '#003366', '#E7EBF0', '#B1BDCD', '#5B7290' ] },
			cc267:{9: [ '#757116', '#AEBC21', '#D9DB56', '#00477F', '#4C88BE', '#8DC3E9' ] },
			cc294:{9: [ '#B7C68B', '#F4F0CB', '#DED29E', '#B3A580', '#685642' ] },
			cc252:{9: [ '#9C9284', '#CCCC99', '#E6E6CC', '#6699CC', '#FF9900' ] },
			cc303:{9: [ '#7A3E48', '#EECD86', '#E18942', '#B95835', '#3D3242' ] },
			cc327:{9: [ '#9D2E2C', '#F9EA99', '#7DB6D5', '#E7A555', '#4A4747' ] },
			ylgn:{3:["rgb(247,252,185)","rgb(173,221,142)","rgb(49,163,84)"],4:["rgb(255,255,204)","rgb(194,230,153)","rgb(120,198,121)","rgb(35,132,67)"],5:["rgb(255,255,204)","rgb(194,230,153)","rgb(120,198,121)","rgb(49,163,84)","rgb(0,104,55)"],6:["rgb(255,255,204)","rgb(217,240,163)","rgb(173,221,142)","rgb(120,198,121)","rgb(49,163,84)","rgb(0,104,55)"],7:["rgb(255,255,204)","rgb(217,240,163)","rgb(173,221,142)","rgb(120,198,121)","rgb(65,171,93)","rgb(35,132,67)","rgb(0,90,50)"],8:["rgb(255,255,229)","rgb(247,252,185)","rgb(217,240,163)","rgb(173,221,142)","rgb(120,198,121)","rgb(65,171,93)","rgb(35,132,67)","rgb(0,90,50)"],9:["rgb(255,255,229)","rgb(247,252,185)","rgb(217,240,163)","rgb(173,221,142)","rgb(120,198,121)","rgb(65,171,93)","rgb(35,132,67)","rgb(0,104,55)","rgb(0,69,41)"]},
			ylgnbu:{3:["rgb(237,248,177)","rgb(127,205,187)","rgb(44,127,184)"],4:["rgb(255,255,204)","rgb(161,218,180)","rgb(65,182,196)","rgb(34,94,168)"],5:["rgb(255,255,204)","rgb(161,218,180)","rgb(65,182,196)","rgb(44,127,184)","rgb(37,52,148)"],6:["rgb(255,255,204)","rgb(199,233,180)","rgb(127,205,187)","rgb(65,182,196)","rgb(44,127,184)","rgb(37,52,148)"],7:["rgb(255,255,204)","rgb(199,233,180)","rgb(127,205,187)","rgb(65,182,196)","rgb(29,145,192)","rgb(34,94,168)","rgb(12,44,132)"],8:["rgb(255,255,217)","rgb(237,248,177)","rgb(199,233,180)","rgb(127,205,187)","rgb(65,182,196)","rgb(29,145,192)","rgb(34,94,168)","rgb(12,44,132)"],9:["rgb(255,255,217)","rgb(237,248,177)","rgb(199,233,180)","rgb(127,205,187)","rgb(65,182,196)","rgb(29,145,192)","rgb(34,94,168)","rgb(37,52,148)","rgb(8,29,88)"]},
			gnbu:{3:["rgb(224,243,219)","rgb(168,221,181)","rgb(67,162,202)"],4:["rgb(240,249,232)","rgb(186,228,188)","rgb(123,204,196)","rgb(43,140,190)"],5:["rgb(240,249,232)","rgb(186,228,188)","rgb(123,204,196)","rgb(67,162,202)","rgb(8,104,172)"],6:["rgb(240,249,232)","rgb(204,235,197)","rgb(168,221,181)","rgb(123,204,196)","rgb(67,162,202)","rgb(8,104,172)"],7:["rgb(240,249,232)","rgb(204,235,197)","rgb(168,221,181)","rgb(123,204,196)","rgb(78,179,211)","rgb(43,140,190)","rgb(8,88,158)"],8:["rgb(247,252,240)","rgb(224,243,219)","rgb(204,235,197)","rgb(168,221,181)","rgb(123,204,196)","rgb(78,179,211)","rgb(43,140,190)","rgb(8,88,158)"],9:["rgb(247,252,240)","rgb(224,243,219)","rgb(204,235,197)","rgb(168,221,181)","rgb(123,204,196)","rgb(78,179,211)","rgb(43,140,190)","rgb(8,104,172)","rgb(8,64,129)"]},
			bugn:{3:["rgb(229,245,249)","rgb(153,216,201)","rgb(44,162,95)"],4:["rgb(237,248,251)","rgb(178,226,226)","rgb(102,194,164)","rgb(35,139,69)"],5:["rgb(237,248,251)","rgb(178,226,226)","rgb(102,194,164)","rgb(44,162,95)","rgb(0,109,44)"],6:["rgb(237,248,251)","rgb(204,236,230)","rgb(153,216,201)","rgb(102,194,164)","rgb(44,162,95)","rgb(0,109,44)"],7:["rgb(237,248,251)","rgb(204,236,230)","rgb(153,216,201)","rgb(102,194,164)","rgb(65,174,118)","rgb(35,139,69)","rgb(0,88,36)"],8:["rgb(247,252,253)","rgb(229,245,249)","rgb(204,236,230)","rgb(153,216,201)","rgb(102,194,164)","rgb(65,174,118)","rgb(35,139,69)","rgb(0,88,36)"],9:["rgb(247,252,253)","rgb(229,245,249)","rgb(204,236,230)","rgb(153,216,201)","rgb(102,194,164)","rgb(65,174,118)","rgb(35,139,69)","rgb(0,109,44)","rgb(0,68,27)"]},
			pubugn:{3:["rgb(236,226,240)","rgb(166,189,219)","rgb(28,144,153)"],4:["rgb(246,239,247)","rgb(189,201,225)","rgb(103,169,207)","rgb(2,129,138)"],5:["rgb(246,239,247)","rgb(189,201,225)","rgb(103,169,207)","rgb(28,144,153)","rgb(1,108,89)"],6:["rgb(246,239,247)","rgb(208,209,230)","rgb(166,189,219)","rgb(103,169,207)","rgb(28,144,153)","rgb(1,108,89)"],7:["rgb(246,239,247)","rgb(208,209,230)","rgb(166,189,219)","rgb(103,169,207)","rgb(54,144,192)","rgb(2,129,138)","rgb(1,100,80)"],8:["rgb(255,247,251)","rgb(236,226,240)","rgb(208,209,230)","rgb(166,189,219)","rgb(103,169,207)","rgb(54,144,192)","rgb(2,129,138)","rgb(1,100,80)"],9:["rgb(255,247,251)","rgb(236,226,240)","rgb(208,209,230)","rgb(166,189,219)","rgb(103,169,207)","rgb(54,144,192)","rgb(2,129,138)","rgb(1,108,89)","rgb(1,70,54)"]},
			pubu:{3:["rgb(236,231,242)","rgb(166,189,219)","rgb(43,140,190)"],4:["rgb(241,238,246)","rgb(189,201,225)","rgb(116,169,207)","rgb(5,112,176)"],5:["rgb(241,238,246)","rgb(189,201,225)","rgb(116,169,207)","rgb(43,140,190)","rgb(4,90,141)"],6:["rgb(241,238,246)","rgb(208,209,230)","rgb(166,189,219)","rgb(116,169,207)","rgb(43,140,190)","rgb(4,90,141)"],7:["rgb(241,238,246)","rgb(208,209,230)","rgb(166,189,219)","rgb(116,169,207)","rgb(54,144,192)","rgb(5,112,176)","rgb(3,78,123)"],8:["rgb(255,247,251)","rgb(236,231,242)","rgb(208,209,230)","rgb(166,189,219)","rgb(116,169,207)","rgb(54,144,192)","rgb(5,112,176)","rgb(3,78,123)"],9:["rgb(255,247,251)","rgb(236,231,242)","rgb(208,209,230)","rgb(166,189,219)","rgb(116,169,207)","rgb(54,144,192)","rgb(5,112,176)","rgb(4,90,141)","rgb(2,56,88)"]},
			bupu:{3:["rgb(224,236,244)","rgb(158,188,218)","rgb(136,86,167)"],4:["rgb(237,248,251)","rgb(179,205,227)","rgb(140,150,198)","rgb(136,65,157)"],5:["rgb(237,248,251)","rgb(179,205,227)","rgb(140,150,198)","rgb(136,86,167)","rgb(129,15,124)"],6:["rgb(237,248,251)","rgb(191,211,230)","rgb(158,188,218)","rgb(140,150,198)","rgb(136,86,167)","rgb(129,15,124)"],7:["rgb(237,248,251)","rgb(191,211,230)","rgb(158,188,218)","rgb(140,150,198)","rgb(140,107,177)","rgb(136,65,157)","rgb(110,1,107)"],8:["rgb(247,252,253)","rgb(224,236,244)","rgb(191,211,230)","rgb(158,188,218)","rgb(140,150,198)","rgb(140,107,177)","rgb(136,65,157)","rgb(110,1,107)"],9:["rgb(247,252,253)","rgb(224,236,244)","rgb(191,211,230)","rgb(158,188,218)","rgb(140,150,198)","rgb(140,107,177)","rgb(136,65,157)","rgb(129,15,124)","rgb(77,0,75)"]},
			rdpu:{3:["rgb(253,224,221)","rgb(250,159,181)","rgb(197,27,138)"],4:["rgb(254,235,226)","rgb(251,180,185)","rgb(247,104,161)","rgb(174,1,126)"],5:["rgb(254,235,226)","rgb(251,180,185)","rgb(247,104,161)","rgb(197,27,138)","rgb(122,1,119)"],6:["rgb(254,235,226)","rgb(252,197,192)","rgb(250,159,181)","rgb(247,104,161)","rgb(197,27,138)","rgb(122,1,119)"],7:["rgb(254,235,226)","rgb(252,197,192)","rgb(250,159,181)","rgb(247,104,161)","rgb(221,52,151)","rgb(174,1,126)","rgb(122,1,119)"],8:["rgb(255,247,243)","rgb(253,224,221)","rgb(252,197,192)","rgb(250,159,181)","rgb(247,104,161)","rgb(221,52,151)","rgb(174,1,126)","rgb(122,1,119)"],9:["rgb(255,247,243)","rgb(253,224,221)","rgb(252,197,192)","rgb(250,159,181)","rgb(247,104,161)","rgb(221,52,151)","rgb(174,1,126)","rgb(122,1,119)","rgb(73,0,106)"]},
			purd:{3:["rgb(231,225,239)","rgb(201,148,199)","rgb(221,28,119)"],4:["rgb(241,238,246)","rgb(215,181,216)","rgb(223,101,176)","rgb(206,18,86)"],5:["rgb(241,238,246)","rgb(215,181,216)","rgb(223,101,176)","rgb(221,28,119)","rgb(152,0,67)"],6:["rgb(241,238,246)","rgb(212,185,218)","rgb(201,148,199)","rgb(223,101,176)","rgb(221,28,119)","rgb(152,0,67)"],7:["rgb(241,238,246)","rgb(212,185,218)","rgb(201,148,199)","rgb(223,101,176)","rgb(231,41,138)","rgb(206,18,86)","rgb(145,0,63)"],8:["rgb(247,244,249)","rgb(231,225,239)","rgb(212,185,218)","rgb(201,148,199)","rgb(223,101,176)","rgb(231,41,138)","rgb(206,18,86)","rgb(145,0,63)"],9:["rgb(247,244,249)","rgb(231,225,239)","rgb(212,185,218)","rgb(201,148,199)","rgb(223,101,176)","rgb(231,41,138)","rgb(206,18,86)","rgb(152,0,67)","rgb(103,0,31)"]},
			orrd:{3:["rgb(254,232,200)","rgb(253,187,132)","rgb(227,74,51)"],4:["rgb(254,240,217)","rgb(253,204,138)","rgb(252,141,89)","rgb(215,48,31)"],5:["rgb(254,240,217)","rgb(253,204,138)","rgb(252,141,89)","rgb(227,74,51)","rgb(179,0,0)"],6:["rgb(254,240,217)","rgb(253,212,158)","rgb(253,187,132)","rgb(252,141,89)","rgb(227,74,51)","rgb(179,0,0)"],7:["rgb(254,240,217)","rgb(253,212,158)","rgb(253,187,132)","rgb(252,141,89)","rgb(239,101,72)","rgb(215,48,31)","rgb(153,0,0)"],8:["rgb(255,247,236)","rgb(254,232,200)","rgb(253,212,158)","rgb(253,187,132)","rgb(252,141,89)","rgb(239,101,72)","rgb(215,48,31)","rgb(153,0,0)"],9:["rgb(255,247,236)","rgb(254,232,200)","rgb(253,212,158)","rgb(253,187,132)","rgb(252,141,89)","rgb(239,101,72)","rgb(215,48,31)","rgb(179,0,0)","rgb(127,0,0)"]},
			ylorrd:{3:["rgb(255,237,160)","rgb(254,178,76)","rgb(240,59,32)"],4:["rgb(255,255,178)","rgb(254,204,92)","rgb(253,141,60)","rgb(227,26,28)"],5:["rgb(255,255,178)","rgb(254,204,92)","rgb(253,141,60)","rgb(240,59,32)","rgb(189,0,38)"],6:["rgb(255,255,178)","rgb(254,217,118)","rgb(254,178,76)","rgb(253,141,60)","rgb(240,59,32)","rgb(189,0,38)"],7:["rgb(255,255,178)","rgb(254,217,118)","rgb(254,178,76)","rgb(253,141,60)","rgb(252,78,42)","rgb(227,26,28)","rgb(177,0,38)"],8:["rgb(255,255,204)","rgb(255,237,160)","rgb(254,217,118)","rgb(254,178,76)","rgb(253,141,60)","rgb(252,78,42)","rgb(227,26,28)","rgb(177,0,38)"],9:["rgb(255,255,204)","rgb(255,237,160)","rgb(254,217,118)","rgb(254,178,76)","rgb(253,141,60)","rgb(252,78,42)","rgb(227,26,28)","rgb(189,0,38)","rgb(128,0,38)"]},
			ylorbr:{3:["rgb(255,247,188)","rgb(254,196,79)","rgb(217,95,14)"],4:["rgb(255,255,212)","rgb(254,217,142)","rgb(254,153,41)","rgb(204,76,2)"],5:["rgb(255,255,212)","rgb(254,217,142)","rgb(254,153,41)","rgb(217,95,14)","rgb(153,52,4)"],6:["rgb(255,255,212)","rgb(254,227,145)","rgb(254,196,79)","rgb(254,153,41)","rgb(217,95,14)","rgb(153,52,4)"],7:["rgb(255,255,212)","rgb(254,227,145)","rgb(254,196,79)","rgb(254,153,41)","rgb(236,112,20)","rgb(204,76,2)","rgb(140,45,4)"],8:["rgb(255,255,229)","rgb(255,247,188)","rgb(254,227,145)","rgb(254,196,79)","rgb(254,153,41)","rgb(236,112,20)","rgb(204,76,2)","rgb(140,45,4)"],9:["rgb(255,255,229)","rgb(255,247,188)","rgb(254,227,145)","rgb(254,196,79)","rgb(254,153,41)","rgb(236,112,20)","rgb(204,76,2)","rgb(153,52,4)","rgb(102,37,6)"]},
			purples:{3:["rgb(239,237,245)","rgb(188,189,220)","rgb(117,107,177)"],4:["rgb(242,240,247)","rgb(203,201,226)","rgb(158,154,200)","rgb(106,81,163)"],5:["rgb(242,240,247)","rgb(203,201,226)","rgb(158,154,200)","rgb(117,107,177)","rgb(84,39,143)"],6:["rgb(242,240,247)","rgb(218,218,235)","rgb(188,189,220)","rgb(158,154,200)","rgb(117,107,177)","rgb(84,39,143)"],7:["rgb(242,240,247)","rgb(218,218,235)","rgb(188,189,220)","rgb(158,154,200)","rgb(128,125,186)","rgb(106,81,163)","rgb(74,20,134)"],8:["rgb(252,251,253)","rgb(239,237,245)","rgb(218,218,235)","rgb(188,189,220)","rgb(158,154,200)","rgb(128,125,186)","rgb(106,81,163)","rgb(74,20,134)"],9:["rgb(252,251,253)","rgb(239,237,245)","rgb(218,218,235)","rgb(188,189,220)","rgb(158,154,200)","rgb(128,125,186)","rgb(106,81,163)","rgb(84,39,143)","rgb(63,0,125)"]},
			blues:{3:["rgb(222,235,247)","rgb(158,202,225)","rgb(49,130,189)"],4:["rgb(239,243,255)","rgb(189,215,231)","rgb(107,174,214)","rgb(33,113,181)"],5:["rgb(239,243,255)","rgb(189,215,231)","rgb(107,174,214)","rgb(49,130,189)","rgb(8,81,156)"],6:["rgb(239,243,255)","rgb(198,219,239)","rgb(158,202,225)","rgb(107,174,214)","rgb(49,130,189)","rgb(8,81,156)"],7:["rgb(239,243,255)","rgb(198,219,239)","rgb(158,202,225)","rgb(107,174,214)","rgb(66,146,198)","rgb(33,113,181)","rgb(8,69,148)"],8:["rgb(247,251,255)","rgb(222,235,247)","rgb(198,219,239)","rgb(158,202,225)","rgb(107,174,214)","rgb(66,146,198)","rgb(33,113,181)","rgb(8,69,148)"],9:["rgb(247,251,255)","rgb(222,235,247)","rgb(198,219,239)","rgb(158,202,225)","rgb(107,174,214)","rgb(66,146,198)","rgb(33,113,181)","rgb(8,81,156)","rgb(8,48,107)"]},
			greens:{3:["rgb(229,245,224)","rgb(161,217,155)","rgb(49,163,84)"],4:["rgb(237,248,233)","rgb(186,228,179)","rgb(116,196,118)","rgb(35,139,69)"],5:["rgb(237,248,233)","rgb(186,228,179)","rgb(116,196,118)","rgb(49,163,84)","rgb(0,109,44)"],6:["rgb(237,248,233)","rgb(199,233,192)","rgb(161,217,155)","rgb(116,196,118)","rgb(49,163,84)","rgb(0,109,44)"],7:["rgb(237,248,233)","rgb(199,233,192)","rgb(161,217,155)","rgb(116,196,118)","rgb(65,171,93)","rgb(35,139,69)","rgb(0,90,50)"],8:["rgb(247,252,245)","rgb(229,245,224)","rgb(199,233,192)","rgb(161,217,155)","rgb(116,196,118)","rgb(65,171,93)","rgb(35,139,69)","rgb(0,90,50)"],9:["rgb(247,252,245)","rgb(229,245,224)","rgb(199,233,192)","rgb(161,217,155)","rgb(116,196,118)","rgb(65,171,93)","rgb(35,139,69)","rgb(0,109,44)","rgb(0,68,27)"]},
			oranges:{3:["rgb(254,230,206)","rgb(253,174,107)","rgb(230,85,13)"],4:["rgb(254,237,222)","rgb(253,190,133)","rgb(253,141,60)","rgb(217,71,1)"],5:["rgb(254,237,222)","rgb(253,190,133)","rgb(253,141,60)","rgb(230,85,13)","rgb(166,54,3)"],6:["rgb(254,237,222)","rgb(253,208,162)","rgb(253,174,107)","rgb(253,141,60)","rgb(230,85,13)","rgb(166,54,3)"],7:["rgb(254,237,222)","rgb(253,208,162)","rgb(253,174,107)","rgb(253,141,60)","rgb(241,105,19)","rgb(217,72,1)","rgb(140,45,4)"],8:["rgb(255,245,235)","rgb(254,230,206)","rgb(253,208,162)","rgb(253,174,107)","rgb(253,141,60)","rgb(241,105,19)","rgb(217,72,1)","rgb(140,45,4)"],9:["rgb(255,245,235)","rgb(254,230,206)","rgb(253,208,162)","rgb(253,174,107)","rgb(253,141,60)","rgb(241,105,19)","rgb(217,72,1)","rgb(166,54,3)","rgb(127,39,4)"]},
			reds:{3:["rgb(254,224,210)","rgb(252,146,114)","rgb(222,45,38)"],4:["rgb(254,229,217)","rgb(252,174,145)","rgb(251,106,74)","rgb(203,24,29)"],5:["rgb(254,229,217)","rgb(252,174,145)","rgb(251,106,74)","rgb(222,45,38)","rgb(165,15,21)"],6:["rgb(254,229,217)","rgb(252,187,161)","rgb(252,146,114)","rgb(251,106,74)","rgb(222,45,38)","rgb(165,15,21)"],7:["rgb(254,229,217)","rgb(252,187,161)","rgb(252,146,114)","rgb(251,106,74)","rgb(239,59,44)","rgb(203,24,29)","rgb(153,0,13)"],8:["rgb(255,245,240)","rgb(254,224,210)","rgb(252,187,161)","rgb(252,146,114)","rgb(251,106,74)","rgb(239,59,44)","rgb(203,24,29)","rgb(153,0,13)"],9:["rgb(255,245,240)","rgb(254,224,210)","rgb(252,187,161)","rgb(252,146,114)","rgb(251,106,74)","rgb(239,59,44)","rgb(203,24,29)","rgb(165,15,21)","rgb(103,0,13)"]},
			greys:{3:["rgb(240,240,240)","rgb(189,189,189)","rgb(99,99,99)"],4:["rgb(247,247,247)","rgb(204,204,204)","rgb(150,150,150)","rgb(82,82,82)"],5:["rgb(247,247,247)","rgb(204,204,204)","rgb(150,150,150)","rgb(99,99,99)","rgb(37,37,37)"],6:["rgb(247,247,247)","rgb(217,217,217)","rgb(189,189,189)","rgb(150,150,150)","rgb(99,99,99)","rgb(37,37,37)"],7:["rgb(247,247,247)","rgb(217,217,217)","rgb(189,189,189)","rgb(150,150,150)","rgb(115,115,115)","rgb(82,82,82)","rgb(37,37,37)"],8:["rgb(255,255,255)","rgb(240,240,240)","rgb(217,217,217)","rgb(189,189,189)","rgb(150,150,150)","rgb(115,115,115)","rgb(82,82,82)","rgb(37,37,37)"],9:["rgb(255,255,255)","rgb(240,240,240)","rgb(217,217,217)","rgb(189,189,189)","rgb(150,150,150)","rgb(115,115,115)","rgb(82,82,82)","rgb(37,37,37)","rgb(0,0,0)"]},
			puor:{3:["rgb(241,163,64)","rgb(247,247,247)","rgb(153,142,195)"],4:["rgb(230,97,1)","rgb(253,184,99)","rgb(178,171,210)","rgb(94,60,153)"],5:["rgb(230,97,1)","rgb(253,184,99)","rgb(247,247,247)","rgb(178,171,210)","rgb(94,60,153)"],6:["rgb(179,88,6)","rgb(241,163,64)","rgb(254,224,182)","rgb(216,218,235)","rgb(153,142,195)","rgb(84,39,136)"],7:["rgb(179,88,6)","rgb(241,163,64)","rgb(254,224,182)","rgb(247,247,247)","rgb(216,218,235)","rgb(153,142,195)","rgb(84,39,136)"],8:["rgb(179,88,6)","rgb(224,130,20)","rgb(253,184,99)","rgb(254,224,182)","rgb(216,218,235)","rgb(178,171,210)","rgb(128,115,172)","rgb(84,39,136)"],9:["rgb(179,88,6)","rgb(224,130,20)","rgb(253,184,99)","rgb(254,224,182)","rgb(247,247,247)","rgb(216,218,235)","rgb(178,171,210)","rgb(128,115,172)","rgb(84,39,136)"],10:["rgb(127,59,8)","rgb(179,88,6)","rgb(224,130,20)","rgb(253,184,99)","rgb(254,224,182)","rgb(216,218,235)","rgb(178,171,210)","rgb(128,115,172)","rgb(84,39,136)","rgb(45,0,75)"],11:["rgb(127,59,8)","rgb(179,88,6)","rgb(224,130,20)","rgb(253,184,99)","rgb(254,224,182)","rgb(247,247,247)","rgb(216,218,235)","rgb(178,171,210)","rgb(128,115,172)","rgb(84,39,136)","rgb(45,0,75)"]},
			brbg:{3:["rgb(216,179,101)","rgb(245,245,245)","rgb(90,180,172)"],4:["rgb(166,97,26)","rgb(223,194,125)","rgb(128,205,193)","rgb(1,133,113)"],5:["rgb(166,97,26)","rgb(223,194,125)","rgb(245,245,245)","rgb(128,205,193)","rgb(1,133,113)"],6:["rgb(140,81,10)","rgb(216,179,101)","rgb(246,232,195)","rgb(199,234,229)","rgb(90,180,172)","rgb(1,102,94)"],7:["rgb(140,81,10)","rgb(216,179,101)","rgb(246,232,195)","rgb(245,245,245)","rgb(199,234,229)","rgb(90,180,172)","rgb(1,102,94)"],8:["rgb(140,81,10)","rgb(191,129,45)","rgb(223,194,125)","rgb(246,232,195)","rgb(199,234,229)","rgb(128,205,193)","rgb(53,151,143)","rgb(1,102,94)"],9:["rgb(140,81,10)","rgb(191,129,45)","rgb(223,194,125)","rgb(246,232,195)","rgb(245,245,245)","rgb(199,234,229)","rgb(128,205,193)","rgb(53,151,143)","rgb(1,102,94)"],10:["rgb(84,48,5)","rgb(140,81,10)","rgb(191,129,45)","rgb(223,194,125)","rgb(246,232,195)","rgb(199,234,229)","rgb(128,205,193)","rgb(53,151,143)","rgb(1,102,94)","rgb(0,60,48)"],11:["rgb(84,48,5)","rgb(140,81,10)","rgb(191,129,45)","rgb(223,194,125)","rgb(246,232,195)","rgb(245,245,245)","rgb(199,234,229)","rgb(128,205,193)","rgb(53,151,143)","rgb(1,102,94)","rgb(0,60,48)"]},
			prgn:{3:["rgb(175,141,195)","rgb(247,247,247)","rgb(127,191,123)"],4:["rgb(123,50,148)","rgb(194,165,207)","rgb(166,219,160)","rgb(0,136,55)"],5:["rgb(123,50,148)","rgb(194,165,207)","rgb(247,247,247)","rgb(166,219,160)","rgb(0,136,55)"],6:["rgb(118,42,131)","rgb(175,141,195)","rgb(231,212,232)","rgb(217,240,211)","rgb(127,191,123)","rgb(27,120,55)"],7:["rgb(118,42,131)","rgb(175,141,195)","rgb(231,212,232)","rgb(247,247,247)","rgb(217,240,211)","rgb(127,191,123)","rgb(27,120,55)"],8:["rgb(118,42,131)","rgb(153,112,171)","rgb(194,165,207)","rgb(231,212,232)","rgb(217,240,211)","rgb(166,219,160)","rgb(90,174,97)","rgb(27,120,55)"],9:["rgb(118,42,131)","rgb(153,112,171)","rgb(194,165,207)","rgb(231,212,232)","rgb(247,247,247)","rgb(217,240,211)","rgb(166,219,160)","rgb(90,174,97)","rgb(27,120,55)"],10:["rgb(64,0,75)","rgb(118,42,131)","rgb(153,112,171)","rgb(194,165,207)","rgb(231,212,232)","rgb(217,240,211)","rgb(166,219,160)","rgb(90,174,97)","rgb(27,120,55)","rgb(0,68,27)"],11:["rgb(64,0,75)","rgb(118,42,131)","rgb(153,112,171)","rgb(194,165,207)","rgb(231,212,232)","rgb(247,247,247)","rgb(217,240,211)","rgb(166,219,160)","rgb(90,174,97)","rgb(27,120,55)","rgb(0,68,27)"]},
			piyg:{3:["rgb(233,163,201)","rgb(247,247,247)","rgb(161,215,106)"],4:["rgb(208,28,139)","rgb(241,182,218)","rgb(184,225,134)","rgb(77,172,38)"],5:["rgb(208,28,139)","rgb(241,182,218)","rgb(247,247,247)","rgb(184,225,134)","rgb(77,172,38)"],6:["rgb(197,27,125)","rgb(233,163,201)","rgb(253,224,239)","rgb(230,245,208)","rgb(161,215,106)","rgb(77,146,33)"],7:["rgb(197,27,125)","rgb(233,163,201)","rgb(253,224,239)","rgb(247,247,247)","rgb(230,245,208)","rgb(161,215,106)","rgb(77,146,33)"],8:["rgb(197,27,125)","rgb(222,119,174)","rgb(241,182,218)","rgb(253,224,239)","rgb(230,245,208)","rgb(184,225,134)","rgb(127,188,65)","rgb(77,146,33)"],9:["rgb(197,27,125)","rgb(222,119,174)","rgb(241,182,218)","rgb(253,224,239)","rgb(247,247,247)","rgb(230,245,208)","rgb(184,225,134)","rgb(127,188,65)","rgb(77,146,33)"],10:["rgb(142,1,82)","rgb(197,27,125)","rgb(222,119,174)","rgb(241,182,218)","rgb(253,224,239)","rgb(230,245,208)","rgb(184,225,134)","rgb(127,188,65)","rgb(77,146,33)","rgb(39,100,25)"],11:["rgb(142,1,82)","rgb(197,27,125)","rgb(222,119,174)","rgb(241,182,218)","rgb(253,224,239)","rgb(247,247,247)","rgb(230,245,208)","rgb(184,225,134)","rgb(127,188,65)","rgb(77,146,33)","rgb(39,100,25)"]},
			rdbu:{3:["rgb(239,138,98)","rgb(247,247,247)","rgb(103,169,207)"],4:["rgb(202,0,32)","rgb(244,165,130)","rgb(146,197,222)","rgb(5,113,176)"],5:["rgb(202,0,32)","rgb(244,165,130)","rgb(247,247,247)","rgb(146,197,222)","rgb(5,113,176)"],6:["rgb(178,24,43)","rgb(239,138,98)","rgb(253,219,199)","rgb(209,229,240)","rgb(103,169,207)","rgb(33,102,172)"],7:["rgb(178,24,43)","rgb(239,138,98)","rgb(253,219,199)","rgb(247,247,247)","rgb(209,229,240)","rgb(103,169,207)","rgb(33,102,172)"],8:["rgb(178,24,43)","rgb(214,96,77)","rgb(244,165,130)","rgb(253,219,199)","rgb(209,229,240)","rgb(146,197,222)","rgb(67,147,195)","rgb(33,102,172)"],9:["rgb(178,24,43)","rgb(214,96,77)","rgb(244,165,130)","rgb(253,219,199)","rgb(247,247,247)","rgb(209,229,240)","rgb(146,197,222)","rgb(67,147,195)","rgb(33,102,172)"],10:["rgb(103,0,31)","rgb(178,24,43)","rgb(214,96,77)","rgb(244,165,130)","rgb(253,219,199)","rgb(209,229,240)","rgb(146,197,222)","rgb(67,147,195)","rgb(33,102,172)","rgb(5,48,97)"],11:["rgb(103,0,31)","rgb(178,24,43)","rgb(214,96,77)","rgb(244,165,130)","rgb(253,219,199)","rgb(247,247,247)","rgb(209,229,240)","rgb(146,197,222)","rgb(67,147,195)","rgb(33,102,172)","rgb(5,48,97)"]},
			rdgy:{3:["rgb(239,138,98)","rgb(255,255,255)","rgb(153,153,153)"],4:["rgb(202,0,32)","rgb(244,165,130)","rgb(186,186,186)","rgb(64,64,64)"],5:["rgb(202,0,32)","rgb(244,165,130)","rgb(255,255,255)","rgb(186,186,186)","rgb(64,64,64)"],6:["rgb(178,24,43)","rgb(239,138,98)","rgb(253,219,199)","rgb(224,224,224)","rgb(153,153,153)","rgb(77,77,77)"],7:["rgb(178,24,43)","rgb(239,138,98)","rgb(253,219,199)","rgb(255,255,255)","rgb(224,224,224)","rgb(153,153,153)","rgb(77,77,77)"],8:["rgb(178,24,43)","rgb(214,96,77)","rgb(244,165,130)","rgb(253,219,199)","rgb(224,224,224)","rgb(186,186,186)","rgb(135,135,135)","rgb(77,77,77)"],9:["rgb(178,24,43)","rgb(214,96,77)","rgb(244,165,130)","rgb(253,219,199)","rgb(255,255,255)","rgb(224,224,224)","rgb(186,186,186)","rgb(135,135,135)","rgb(77,77,77)"],10:["rgb(103,0,31)","rgb(178,24,43)","rgb(214,96,77)","rgb(244,165,130)","rgb(253,219,199)","rgb(224,224,224)","rgb(186,186,186)","rgb(135,135,135)","rgb(77,77,77)","rgb(26,26,26)"],11:["rgb(103,0,31)","rgb(178,24,43)","rgb(214,96,77)","rgb(244,165,130)","rgb(253,219,199)","rgb(255,255,255)","rgb(224,224,224)","rgb(186,186,186)","rgb(135,135,135)","rgb(77,77,77)","rgb(26,26,26)"]},
			rdylbu:{3:["rgb(252,141,89)","rgb(255,255,191)","rgb(145,191,219)"],4:["rgb(215,25,28)","rgb(253,174,97)","rgb(171,217,233)","rgb(44,123,182)"],5:["rgb(215,25,28)","rgb(253,174,97)","rgb(255,255,191)","rgb(171,217,233)","rgb(44,123,182)"],6:["rgb(215,48,39)","rgb(252,141,89)","rgb(254,224,144)","rgb(224,243,248)","rgb(145,191,219)","rgb(69,117,180)"],7:["rgb(215,48,39)","rgb(252,141,89)","rgb(254,224,144)","rgb(255,255,191)","rgb(224,243,248)","rgb(145,191,219)","rgb(69,117,180)"],8:["rgb(215,48,39)","rgb(244,109,67)","rgb(253,174,97)","rgb(254,224,144)","rgb(224,243,248)","rgb(171,217,233)","rgb(116,173,209)","rgb(69,117,180)"],9:["rgb(215,48,39)","rgb(244,109,67)","rgb(253,174,97)","rgb(254,224,144)","rgb(255,255,191)","rgb(224,243,248)","rgb(171,217,233)","rgb(116,173,209)","rgb(69,117,180)"],10:["rgb(165,0,38)","rgb(215,48,39)","rgb(244,109,67)","rgb(253,174,97)","rgb(254,224,144)","rgb(224,243,248)","rgb(171,217,233)","rgb(116,173,209)","rgb(69,117,180)","rgb(49,54,149)"],11:["rgb(165,0,38)","rgb(215,48,39)","rgb(244,109,67)","rgb(253,174,97)","rgb(254,224,144)","rgb(255,255,191)","rgb(224,243,248)","rgb(171,217,233)","rgb(116,173,209)","rgb(69,117,180)","rgb(49,54,149)"]},
			spectral:{3:["rgb(252,141,89)","rgb(255,255,191)","rgb(153,213,148)"],4:["rgb(215,25,28)","rgb(253,174,97)","rgb(171,221,164)","rgb(43,131,186)"],5:["rgb(215,25,28)","rgb(253,174,97)","rgb(255,255,191)","rgb(171,221,164)","rgb(43,131,186)"],6:["rgb(213,62,79)","rgb(252,141,89)","rgb(254,224,139)","rgb(230,245,152)","rgb(153,213,148)","rgb(50,136,189)"],7:["rgb(213,62,79)","rgb(252,141,89)","rgb(254,224,139)","rgb(255,255,191)","rgb(230,245,152)","rgb(153,213,148)","rgb(50,136,189)"],8:["rgb(213,62,79)","rgb(244,109,67)","rgb(253,174,97)","rgb(254,224,139)","rgb(230,245,152)","rgb(171,221,164)","rgb(102,194,165)","rgb(50,136,189)"],9:["rgb(213,62,79)","rgb(244,109,67)","rgb(253,174,97)","rgb(254,224,139)","rgb(255,255,191)","rgb(230,245,152)","rgb(171,221,164)","rgb(102,194,165)","rgb(50,136,189)"],10:["rgb(158,1,66)","rgb(213,62,79)","rgb(244,109,67)","rgb(253,174,97)","rgb(254,224,139)","rgb(230,245,152)","rgb(171,221,164)","rgb(102,194,165)","rgb(50,136,189)","rgb(94,79,162)"],11:["rgb(158,1,66)","rgb(213,62,79)","rgb(244,109,67)","rgb(253,174,97)","rgb(254,224,139)","rgb(255,255,191)","rgb(230,245,152)","rgb(171,221,164)","rgb(102,194,165)","rgb(50,136,189)","rgb(94,79,162)"]},
			rdylgn:{3:["rgb(252,141,89)","rgb(255,255,191)","rgb(145,207,96)"],4:["rgb(215,25,28)","rgb(253,174,97)","rgb(166,217,106)","rgb(26,150,65)"],5:["rgb(215,25,28)","rgb(253,174,97)","rgb(255,255,191)","rgb(166,217,106)","rgb(26,150,65)"],6:["rgb(215,48,39)","rgb(252,141,89)","rgb(254,224,139)","rgb(217,239,139)","rgb(145,207,96)","rgb(26,152,80)"],7:["rgb(215,48,39)","rgb(252,141,89)","rgb(254,224,139)","rgb(255,255,191)","rgb(217,239,139)","rgb(145,207,96)","rgb(26,152,80)"],8:["rgb(215,48,39)","rgb(244,109,67)","rgb(253,174,97)","rgb(254,224,139)","rgb(217,239,139)","rgb(166,217,106)","rgb(102,189,99)","rgb(26,152,80)"],9:["rgb(215,48,39)","rgb(244,109,67)","rgb(253,174,97)","rgb(254,224,139)","rgb(255,255,191)","rgb(217,239,139)","rgb(166,217,106)","rgb(102,189,99)","rgb(26,152,80)"],10:["rgb(165,0,38)","rgb(215,48,39)","rgb(244,109,67)","rgb(253,174,97)","rgb(254,224,139)","rgb(217,239,139)","rgb(166,217,106)","rgb(102,189,99)","rgb(26,152,80)","rgb(0,104,55)"],11:["rgb(165,0,38)","rgb(215,48,39)","rgb(244,109,67)","rgb(253,174,97)","rgb(254,224,139)","rgb(255,255,191)","rgb(217,239,139)","rgb(166,217,106)","rgb(102,189,99)","rgb(26,152,80)","rgb(0,104,55)"]}
		};

	     var defaultBarChartOptions = {
				// Only animate if we're not using excanvas (not in IE 7 or IE 8)..
				title: {text:'',show:true},
				animate: true,
				seriesDefaults:{
					renderer:$.jqplot.BarRenderer,
					rendererOptions: {
						barDirection: 'vertical',
						showDataLabels: true,
					},
					pointLabels: { show: false }
				},
				seriesColor:colorscheme['rdgy'][9],
				axesDefaults: {
					tickRenderer: $.jqplot.CanvasAxisTickRenderer,
				},
				axes: {
					xaxis: {
						renderer: $.jqplot.CategoryAxisRenderer,
						tickOptions: {
						  angle: -30,
						  fontSize: '10pt',
						  formatter:function(format,value){ 
								return spqlib.jqplot().defaultCutLongLabelFormatter(format,value); 
							}
						},
						 labelRenderer: $.jqplot.CanvasAxisLabelRenderer,
						 labelOptions: {
							fontSize: '14pt'
						  }
					},
					yaxis:{
						tickOptions: {
						  fontSize: '10pt'
						},
						 labelRenderer: $.jqplot.CanvasAxisLabelRenderer,
						 labelOptions: {
							fontSize: '14pt'
						  }
					}
				},
				legend: {
					show: true,
					location: 'ne',
					placement: 'inside'
				}      
			}
			
			var defaultCutLongLabelFormatter = function(format,value){
				  var maxLength = 15;
				  if (value.length>maxLength){
					  value = value.substr(0,maxLength)+"...";
				  }
				  return value;
			  }
			
			function defaultBarchartTooltipContentEditor(str, seriesIndex, pointIndex, plot) {
				var label = plot.axes.xaxis.ticks[pointIndex];
				var html = "<span class='jqplot-tooltip-label'>"+label+"</span></br><span class='jqplot-tooltip-series-name'>"+plot.series[seriesIndex]["label"] + " = </span>";
				var value = "";
				if (Array.isArray(plot.data[seriesIndex][pointIndex])){
					var arrayLength = plot.data[seriesIndex][pointIndex].length;
					value = plot.data[seriesIndex][pointIndex][arrayLength-1];
				} else {
					value = plot.data[seriesIndex][pointIndex];
				}
				html+="<span class='jqplot-tooltip-value'>"+value+"</span>";
				return html;
			}
			
			var defaultPieChartOptions = {
				animate: true,
				title: {text:'',show:true},
				seriesColor:colorscheme['rdgy'][9],
				  seriesDefaults: {
					// Make this a pie chart.
					renderer: jQuery.jqplot.PieRenderer, 
					rendererOptions: {
					  // Put data labels on the pie slices.
					  // By default, labels show the percentage of the slice.
					  showDataLabels: true,
					  sliceMargin: 0, 
					}
				  }, 
				  legend: { show:true, location: 'e' }
				}
				
			function defaultPiechartTooltipContentEditor(str, seriesIndex, pointIndex, plot) {
				var label =  plot.data[seriesIndex][pointIndex][0];
				var value = plot.data[seriesIndex][pointIndex][1];
				var html = spqlib.piechart.defaultPieChartTooltipContent(label,value);
				return html;

			}			
				
			var defaultDonutChartOptions = {
				animate: true,
				title: {text:'',show:true},
				seriesColor:colorscheme['spectral'][9],
				seriesDefaults: {
				  // make this a donut chart.
				  renderer:$.jqplot.DonutRenderer,
				  rendererOptions:{
					// Donut's can be cut into slices like pies.
					sliceMargin: 3,
					// Pies and donuts can start at any arbitrary angle.
					startAngle: -90,
					showDataLabels: true,
					// By default, data labels show the percentage of the donut/pie.
					// You can show the data 'value' or data 'label' instead.
				  }
				},
				highlighter: { 
					show: true,tooltipLocation:'n',
					useAxesFormatters: false,
					formatString:'%s, %P',
					tooltipContentEditor:defaultPiechartTooltipContentEditor 					
					},
				legend: { show:true, location: 'e' }
			  }
			  
			 var defaultBubbleChartOptions = {
				title: {text:'',show:true},
				seriesDefaults:{
					renderer: $.jqplot.BubbleRenderer,
					rendererOptions: {
						bubbleAlpha: 0.6,
						highlightAlpha: 0.8,
						showLabels: true
					},
					shadow: true,
					shadowAlpha: 0.05
				},
				axes: {
						xaxis: {
							 labelRenderer: $.jqplot.CanvasAxisLabelRenderer,
							 labelOptions: {
								fontSize: '14pt'
							  },
							  tickOptions: {}
						},
						yaxis:{
							 labelRenderer: $.jqplot.CanvasAxisLabelRenderer,
							 labelOptions: {
								fontSize: '14pt'
							  },
							  tickOptions: {}
						}
					}
			}
	
	     /**
		 *  label - array di stringhe
		 *  series - array di array
		 **/
	    function drawBarChart(label,series,config){
			var s = createBarchartSeries(label,series);		
		    var options= getBarChartOptions(config);	
			options.seriesDefaults.renderer=$.jqplot.BarRenderer;
			var plot = $.jqplot(config.divId, s,options );
			plot.config = config;
			c[config.divId]=config.plot=plot;
			/*$("#"+config.divId).bind('jqplotClick',function(ev){
				var chartId = ev.currentTarget.id;
				var tooltip = $("#"+chartId+" .jqplot-highlighter-tooltip");
				tooltip.hide();
			});*/
			$("#"+config.divId).bind('jqplotDataClick',
				function (ev, seriesIndex, pointIndex, data) { 
					var chartId = ev.currentTarget.id;
					var chart = $("#"+chartId)[0];
					var tooltip = $("#"+chartId+" .jqplot-highlighter-tooltip");		
					var offsetLeft = chart.offsetLeft;	
					var offsetTop = chart.offsetTop;	
					var x = ev.pageX - offsetLeft;
					var y = ev.pageY - offsetTop;
					var oldPointIndex = tooltip.attr("pointIndex");
					tooltip.attr("pointIndex",pointIndex+"-"+seriesIndex);
					tooltip.css("position","absolute");
					tooltip.css("left",x+"px");
					tooltip.css("top",y+"px");
					tooltip.css("z-index","999");
					var plot = config.plot;
					var label = plot.data[seriesIndex][pointIndex][0];
					var value = plot.data[seriesIndex][pointIndex][1];
					var html = config.barChartTooltipContent ? config.barChartTooltipContent.call(label,value,config,seriesIndex) : spqlib.barchart.defaultBarChartTooltipContent(label,value,config,seriesIndex);
					if (oldPointIndex!=pointIndex+"-"+seriesIndex){
						tooltip.show();
					} else {
						tooltip.toggle();
					}
					tooltip.html(html);
					//ev.stopImmediatePropagation();//per evitare di triggere il jqplotClick
				}
			);		


			
			return plot;				
		}
		
		 /**
		 *  label - array di stringhe
		 *  series - array di array
		 **/
	    function drawPieChart(label,series,config){
			  var options= getPieChartOptions(config);
			  var data = createSeries(label,series);
			  var plot1 = jQuery.jqplot (config.divId, [data], options);
			  plot1.config = config;
			  c[config.divId]=plot1;
				$("#"+config.divId).bind('jqplotDataClick',
					function (ev, seriesIndex, pointIndex, data) { 			
					    var chartId = ev.currentTarget.id;
						var chart = $("#"+chartId)[0];
						var tooltip = $("#"+chartId+" .jqplot-highlighter-tooltip");		
                       	var offsetLeft = chart.offsetLeft;	
						var offsetTop = chart.offsetTop;	
						var x = ev.pageX - offsetLeft;
						var y = ev.pageY - offsetTop;
						var oldPointIndex = tooltip.attr("pointIndex");
						tooltip.attr("pointIndex",pointIndex);
						tooltip.css("position","absolute");
						tooltip.css("left",x+"px");
						tooltip.css("top",y+"px");
						tooltip.css("z-index","999");
						var html = config.pieChartTooltipContent ? config.pieChartTooltipContent.call(data[0],data[1],config) : spqlib.piechart.defaultPieChartTooltipContent(data[0],data[1],config);
						if (oldPointIndex!=pointIndex){
							tooltip.show();
						} else {
							tooltip.toggle();
						}
						tooltip.html(html);
					}
				);


			  
			  
			  return plot1;
		}
		
		
		/**
		 *  label - array di stringhe
		 *  series - array di array
		 **/
	    function drawDonutChart(label,series,config){
			  var options= getDonutChartOptions(config);
			  var data = createSeries(label,series);
			   if (series.length==1){
				   data = [data];			  	
			  }
			  var plot1 = jQuery.jqplot (config.divId, data, options);
			  c[config.divId]=plot1;
			  return plot1;
		}
		
	    /**
		 *  label - array di stringhe
		 *  series - array di array
		 **/
	    function drawBubbleChart(label,series,config){
			  var options= getBubbleChartOptions(config);
			  var data = createBubbleSeries(label,series);
			  var graphId = config.divId;
			  var plot = jQuery.jqplot (graphId, [data], options);
			  plot.config = config;
			  c[graphId]=plot;
			  if (config.extraOptions[PROP_CHART_LEGEND_SHOW]=="true"){
				  if (config.drawLegendCallback && typeof config.drawLegendCallback =="function"){
					  config.drawLegendCallback(config,data);
				  } else {
					  defaultDrawLegend(config,data);
				  }
			  }
			  $("#"+graphId).bind('jqplotDataClick', config.bubbleChartDataHighlightCallback || defaultBubbleChartDataHighlight);
			  //$("#"+graphId).bind('jqplotDataUnhighlight', config.bubbleChartDataUnhighlightCallback || defaultBubbleChartDataUnhighlight);
			  // $("#"+config.divId).bind('mousewheel DOMMouseScroll',plot,onMouseWheel ); 
			  return plot;
		}
		
		function defaultDrawLegend(config,data){
			var graphId = config.divId;
			var first = config.extraOptions[PROP_CHART_LEGEND_COLUMN_ASSET] || "Label";
			var second = config.extraOptions[PROP_CHART_LEGEND_COLUMN_RADIUS] || "Radius";
			$('#'+graphId+"-legend").html("");
			$('#'+graphId+"-legend").append("<table><thead><tr><th>"+first+"</th><th>"+second+"</th></tr></thead><tbody></tbody></table>");
			$.each(data, function(index, val) {
				$('#'+graphId+"-legend tbody").append('<tr><td>'+val[3]+'</td><td>'+val[2]+'</td></tr>');
			  });
		}
		
		function defaultBubbleChartDataHighlight(ev, seriesIndex, pointIndex, data, radius){
			var graphId = $(ev.target).attr("id");
			var legendIdSelector = "#"+graphId+"-legend";
			var plot = c[graphId];
			var config = plot.config;
			var chart_left = $("#"+graphId).offset().left;
			var chart_top = $("#"+graphId).offset().top;
			var x = plot.axes.xaxis.u2p(data[0]);  // convert x axis unita to pixels on grid
			var	y = plot.axes.yaxis.u2p(data[1]);  // convert y axis units to pixels on grid
			var assetName = data[3];
			var xValue = data[0];
			var yValue = data[1];
			var rValue = data[2];
			var xLabel = config.extraOptions[PROP_CHART_TOOLTIP_X_LABEL] || "x";
			var yLabel = config.extraOptions[PROP_CHART_TOOLTIP_Y_LABEL] || "y";
			var rLabel = config.extraOptions[PROP_CHART_TOOLTIP_R_LABEL] || "r";
            var labelPattern = config.extraOptions[PROP_CHART_TOOLTIP_LABEL_PATTERN] || "{%s}";
			var showLink = config.extraOptions[PROP_CHART_TOOLTIP_LABEL_LINK_SHOW] || "false";
			var labelLinkPattern = config.extraOptions[PROP_CHART_TOOLTIP_LABEL_LINK_PATTERN];
			var assetNameSpan = "";
			var assetNameText = spqlib.util.formatString(labelPattern,assetName);
			if (showLink && labelLinkPattern){
				var link = spqlib.util.formatString(labelLinkPattern,assetName);
				assetNameSpan = "<a href='"+link+"'>"+assetNameText+"</a>";
			} else {
				assetNameSpan = assetNameText;
			}
			var xValuePattern = config.extraOptions[PROP_CHART_TOOLTIP_X_VALUE_PATTERN];
			var yValuePattern = config.extraOptions[PROP_CHART_TOOLTIP_Y_VALUE_PATTERN];
			var rValuePattern = config.extraOptions[PROP_CHART_TOOLTIP_R_VALUE_PATTERN];
			xValue = xValuePattern ? spqlib.util.formatString(xValuePattern,xValue,"{%d}") : xValue;
			yValue = yValuePattern ? spqlib.util.formatString(yValuePattern,yValue,"{%d}") : yValue;
			rValue = rValuePattern ? spqlib.util.formatString(rValuePattern,rValue,"{%d}") : rValue;
			
			$('#tooltip1b').css({left:chart_left+x+5, top:chart_top+y});
			var oldAssetName = $('#tooltip1b').attr("label");
			$('#tooltip1b').attr("label",assetName);
			$('#tooltip1b').html('<span class="close" onclick="javascript:$(this).parent().hide();">x</span><span class="instance-name">' + 
			assetNameSpan + '</span><br />' +xLabel+' '+xValue + '<br />' +yLabel+ ' ' + 
			yValue + '<br />' + rLabel+' ' + rValue);
			if (oldAssetName!=assetName){
				$('#tooltip1b').show();
			} else {
				$('#tooltip1b').toggle();
			}
			//$(legendIdSelector+' tr td').css('background-color', '#ffffff !important');
			//$(legendIdSelector+' tr td').eq(pointIndex+1).css('background-color', color);
		}
		
		function defaultBubbleChartDataUnhighlight(ev, seriesIndex, pointIndex, data) {
			var graphId = $(ev.target).attr("id");
			var legendIdSelector = "#"+graphId+"-legend";
			$('#tooltip1b').empty();
            $('#tooltip1b').hide();
            $(legendIdSelector+' tr').css('background-color', '#ffffff');
		}
		
		
		function createBarchartSeries(label,series){
			var s = [];
			if (series.length==1){
				for (var i=0;i<series[0].length;i++){
					var lab = label[i];
					var value = series[0][i];
					s.push([lab,value]);
				}
				s=[s];
			} else {
				for (var i=0;i<series.length;i++){
					for (var j=0;j<series[i].length;j++){
						var value = series[i][j];
						series[i][j]=[label[j],value];
					}
				}
				for (var i=0;i<series.length;i++){
					s.push(series[i]);
				}
			}
			return s;
		}
		
		
		function createSeries(label,series){
			var s = [];
			if (series.length==1){
				for (var i=0;i<series[0].length;i++){
					var lab = label[i];
					var value = series[0][i];
					s.push([lab,value]);
				}
			} else {
				for (var i=0;i<series.length;i++){
					for (var j=0;j<series[i].length;j++){
						var value = series[i][j];
						series[i][j]=[label[j],value];
					}
				}
				for (var i=0;i<series.length;i++){
					s.push(series[i]);
				}
			}
			return s;
		}
		
		function createBubbleSeries(label,series){
			var s = [];
			for (var j=0;j<series[0].length;j++){
				var x = series[0][j];
				var y = series[1][j];
				var r = series[2][j];
				s.push([x,y,r,label[j]]);//x,y,radius,label
			}
			return s;
		}
		
			
		function getBarChartOptions(config){
			var options = spqlib.util.cloneObject(defaultBarChartOptions);
			if (config.seriesConfiguration){
				var sc = config.seriesConfiguration;
				for (var i=0;i<sc.length;i++){
					var label = sc[i].label;
					var color = sc[i].color;
					if (!options.series){
						options.series = [];
					}
					options.series[i] = {};
					options.series[i].label = label;
					options.series[i].color = color;
				}				
			}	
			var title = config.extraOptions[PROP_CHART_TITLE];
			if (title){
				options.title.text=title;
			}
			var direction = config.extraOptions[PROP_CHART_DIRECTION];
			if (direction && direction!=null && direction!=""){
				options.seriesDefaults.rendererOptions.barDirection=config.direction;
			}
			var xAxisLabel = config.extraOptions[PROP_CHART_AXIS_X_LABEL];
			if (xAxisLabel){
				options.axes.xaxis.label=xAxisLabel;
			}
			var yAxisLabel = config.extraOptions[PROP_CHART_AXIS_Y_LABEL];
			if (yAxisLabel){
				options.axes.yaxis.label=yAxisLabel;
			}
			var showLegend = config.extraOptions[PROP_CHART_LEGEND_SHOW];
			if (showLegend){
				options.legend.show=showLegend=="true" ? true : false;
			}
			var legendLocation = config.extraOptions[PROP_CHART_LEGEND_LOCATION];
			if (legendLocation){
				options.legend.location=legendLocation;
			}
			var xAxisLabelFontSize = config.extraOptions[PROP_CHART_AXIS_X_LABEL_FONT_SIZE];
			if (xAxisLabelFontSize){
				options.axes.xaxis.labelOptions.fontSize=xAxisLabelFontSize;
			}
			var yAxisLabelFontSize = config.extraOptions[PROP_CHART_AXIS_Y_LABEL_FONT_SIZE];
			if (yAxisLabelFontSize){
				options.axes.yaxis.labelOptions.fontSize=yAxisLabelFontSize;
			}
			
			var xAxisFontSize = config.extraOptions[PROP_CHART_AXIS_X_FONT_SIZE];
			if (xAxisFontSize){
				options.axes.xaxis.tickOptions.fontSize=xAxisFontSize;
			}
			var yAxisFontSize = config.extraOptions[PROP_CHART_AXIS_Y_FONT_SIZE];
			if (yAxisFontSize){
				options.axes.yaxis.tickOptions.fontSize=yAxisFontSize;
			}
			var  xAxisAngle = config.extraOptions[PROP_CHART_AXIS_X_ANGLE];
			if (xAxisAngle){
				options.axes.xaxis.tickOptions.angle = xAxisAngle;
			}
			var  yAxisAngle = config.extraOptions[PROP_CHART_AXIS_Y_ANGLE];
			if (yAxisAngle){
				options.axes.yaxis.tickOptions.angle = yAxisAngle;
			}
			var barWidth = config.extraOptions[PROP_CHART_BAR_WIDTH];
			if (barWidth){
				options.seriesDefaults.rendererOptions.barWidth = parseInt(barWidth);
			}
			var barMargin = config.extraOptions[PROP_CHART_BAR_MARGIN]; 
			if (barMargin){
				options.seriesDefaults.rendererOptions.barMargin = parseInt(barMargin);
			}
			var barPadding = config.extraOptions[PROP_CHART_BAR_PADDING]; 
			if (barPadding){
				options.seriesDefaults.rendererOptions.barPadding = parseInt(barPadding);
			}
			return options;
		}
		
		function getPieChartOptions(config){
			var options = spqlib.util.cloneObject(defaultPieChartOptions);
			var title = config.extraOptions[PROP_CHART_TITLE];
			if (title){
				options.title.text=title;
			}
			var seriesColorString = config.extraOptions[spqlib.piechart.PROP.PROP_CHART_SERIES_COLOR];
			if (seriesColorString){
				seriesColorString = seriesColorString.split("'").join("\"");
				var seriesColor = JSON.parse(seriesColorString);
				options.seriesColors = seriesColor;
			}
			return options;
		}
		
		function getDonutChartOptions(config){
			var options = spqlib.util.cloneObject(defaultDonutChartOptions);
			if (config.chartTitle){
				options.title.text=config.chartTitle;
			}
			return options;
		}
		
		function getBubbleChartOptions(config){
			var options = spqlib.util.cloneObject(defaultBubbleChartOptions);
			var op = config.extraOptions;
			var title = op[PROP_CHART_TITLE];
			if (title){
				options.title.text=title;
			}
			var xAxisLabel = op[PROP_CHART_AXIS_X_LABEL];
			if (xAxisLabel){
				options.axes.xaxis.label=xAxisLabel;
			}
			var yAxisLabel = op[PROP_CHART_AXIS_Y_LABEL];
			if (yAxisLabel){
				options.axes.yaxis.label=yAxisLabel;
			}
			var xAxisLabelFontSize = op[PROP_CHART_AXIS_X_LABEL_FONT_SIZE];
			if (xAxisLabelFontSize){
				options.axes.xaxis.labelOptions.fontSize=xAxisLabelFontSize;
			}
			var yAxisLabelFontSize = op[PROP_CHART_AXIS_Y_LABEL_FONT_SIZE];
			if (yAxisLabelFontSize){
				options.axes.yaxis.labelOptions.fontSize=yAxisLabelFontSize;
			}
			var xAxisFontSize =op[PROP_CHART_AXIS_X_FONT_SIZE];
			if (xAxisFontSize){
				options.axes.xaxis.tickOptions.fontSize=xAxisFontSize;
			}
			var yAxisFontSize = op[PROP_CHART_AXIS_Y_FONT_SIZE];
			if (yAxisFontSize){
				options.axes.yaxis.tickOptions.fontSize=yAxisFontSize;
			}
			return options;
		}

		function getChart(chartId){
			if (c[chartId]){
				return c[chartId];
			} else {
				return null;
			}
		}
		
		function onMouseWheel(event) {
			event.preventDefault();
			var plot1 = event.data;
			var config = plot1.config;
			var x = event.originalEvent.pageX - $("#"+config.divId).offset().left;
			var y = event.originalEvent.pageY - $("#"+config.divId).offset().top;
			var directionX = x /$("#"+config.divId).width() - 0.5 ;
			var directionY = y / $("#"+config.divId).height() - 0.5 ;

			v = 1;
			zoomin = event.originalEvent.wheelDelta > 0 || event.originalEvent.detail < 0;
			if(zoomin){
				v = 1;
			}
			else {
				v = -1;
			}
			dtx = (plot1.axes.xaxis.max - plot1.axes.xaxis.min) / 8;
			dty = (plot1.axes.yaxis.max - plot1.axes.yaxis.min) / 8;
			plot1.axes.xaxis.min += dtx * v;
			plot1.axes.yaxis.min += dty * v;
			plot1.axes.xaxis.max -= dtx * v;
			plot1.axes.yaxis.max -= dty * v;

			if(zoomin){           
				plot1.axes.xaxis.min += dtx * directionX * 2;    
				plot1.axes.xaxis.max += dtx * directionX * 2; 
				plot1.axes.yaxis.min -= dty * directionY * 2;    
				plot1.axes.yaxis.max -= dty * directionY * 2; 
			}

			intervalx=(plot1.axes.xaxis.max - plot1.axes.xaxis.min) / (plot1.axes.xaxis.numberTicks);
			plot1.axes.xaxis.tickInterval = intervalx;
			intervaly=(plot1.axes.yaxis.max - plot1.axes.yaxis.min) / (plot1.axes.yaxis.numberTicks);
			plot1.axes.yaxis.tickInterval = intervaly;

			plot1.replot();
		}
		
		
		
		return { 
		     drawBarChart:drawBarChart,
			 drawPieChart:drawPieChart,
			 drawDonutChart:drawDonutChart,
			 drawBubbleChart:drawBubbleChart,
			 defaultCutLongLabelFormatter:defaultCutLongLabelFormatter,
			 getChart:getChart
		}

	});

}(spqlib, jQuery));