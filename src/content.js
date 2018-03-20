/*	To Do List:
*	1. Lunch break
*	2. Sort schedule by preference
*/


var classArr = [];		// contains classes to construct schedule with
var scheduleArr = [];	// contains all the schedules
var modal, modalChild;
var preferences = {
	breakTime: null,
	noPrefMet: false
}
let prefMat = new Map();
createModal();			// creates modal and appends to doc
var ready = false;		// allows modal to load

// creates button
var addClassButton = document.createElement("span");
addClassButton.setAttribute("width", "auto");
var btn = document.createElement("button");
btn.setAttribute("class", "myButton");
btn.innerHTML = "Add to Schedule";
addClassButton.appendChild(btn);

// sets parent node to course titles on either class search page or class cart page
var parent = document.getElementById("classSearchResultsCarousel") !== null ? document.getElementById("classSearchResultsCarousel")
						.getElementsByClassName("left") : null;
var parent2 = document.getElementById("studentCart") !== null ? document.getElementById("studentCart")
						.getElementsByClassName("left") : null;

// necessary for timeout
var timeout = null;
var t = null;

// gets current page
var page = "";
var focusPage = document.getElementsByClassName("yui-carousel-item yui-carousel-item-selected");
if (focusPage.length !== 0) {
	page = focusPage[0].getElementsByTagName("h1")[0].innerHTML;
}

// constant font
var font = $(".classAbbreviation").css('font-family');

// updates class and adds buttons if the DOM subtree is changed
var observer = new MutationObserver(function () {
	if(parent !== null && parent2 !== null) {
			if (parent.length !== 0 || parent2.length !== 0) {
		    	if (timeout) {
		        clearTimeout(timeout);
		    	}
		    	page = focusPage[0].getElementsByTagName("h1")[0].innerHTML;
		    	ready = false;
		    	if (page === "Class Cart") {
		   		updateClassArr();
		    	}

		    	timeout = setTimeout(addBtn, 100);

		 	}
	}
});
observer.observe(document, {childList: true, subtree: true});


/*
*	Creates the modal with the default to display an error message
*/
function createModal() {
	modal = document.createElement("div");
	modal.className = "modal";
	modal.id = "scheduleView";
	modalChild = document.createElement("div");
	modalChild.id = "modalChild";
	modalChild.className = "modal-content";
	var modalHeader = document.createElement("div");
	$(modalHeader).attr({'class': 'modal-header'});
	modalChild.appendChild(modalHeader);
	var close = document.createElement("div");
	$(close).attr({'class': 'close'});
	close.innerHTML = "&times;";
	modalHeader.appendChild(close);
	var modalHeaderText = document.createElement("h2");
	modalHeaderText.innerHTML = "<p>Error in making schedule.<p>";
	modalHeaderText.id = "modalHeaderText";
	modalHeaderText.style = "color:red";
	$(modalHeaderText).css({'font-weight': 'bold', 'font-size': '1.5em', 'margin': 'auto'});
	modalHeader.appendChild(modalHeaderText);
	modal.appendChild(modalChild);
	var modalBody = document.createElement("div");
	modalBody.className = "modal-body";
	modalBody.id = "modalBody";
	modalChild.appendChild(modalBody);
	var modalfooter = document.createElement("div");
	modalfooter.className = "modal-footer";
	modalChild.appendChild(modalfooter);
	document.querySelector("body").appendChild(modal);

	let prefModal = document.createElement("div");

	chrome.storage.sync.get("pref", (obj) => {
		if (obj !== undefined && obj !== null && !$.isEmptyObject(obj)) {
			preferences = obj.pref;
		} else {
			chrome.storage.sync.set({"pref" : preferences});
		}
		getFromStorageAndCreateModal(prefModal)
	});

	// creates preference modal
	prefModal.className = "modal";
	prefModal.id = "pref-modal";
	let divOuter = document.createElement("div");
	divOuter.className = "modal-content preference-modal";
	prefModal.appendChild(divOuter);
	let div = document.createElement("div");
	div.className = "pref-modal-body";
	divOuter.appendChild(div);


	let prefClose = document.createElement("span");
	prefClose.className = "close";
	prefClose.innerHTML = "&times;";
	div.appendChild(prefClose);

	let head = document.createElement("h1");
	head.innerHTML = "Preferences";
	div.appendChild(head);

	let div2 = document.createElement("div");
	div.appendChild(div2);

	let p = document.createElement("p");
	p.innerHTML = "Select the time(s) you do <strong><i>not</i></strong> want class below. Schedules that have classes during these times will be at the bottom of the list unless \"Do not show schedules that conflict with break times\" is checked, in which case they will not be shown. "

	div2.appendChild(p);
	div2.className = "pref-modal-text";

	// exit if clicked not on modal
	window.onclick = (event) => {
		if (event.target == modal) {
			modal.style.display = "none";
			modalBody.innerHTML = "";
		} else if (event.target == prefModal) {
			prefModal.style.display = "none";
			updatePreferences();
		}
	};

	 // exit if close button is clicked
	close.onclick = function() {
		modal.style.display = "none";
	  	modalBody.innerHTML = "";
	};

	prefClose.onclick = function() {
		prefModal.style.display = "none";
		updatePreferences();
	};

}


/*
*	Creates preferences modal and gets information from storage
*/
function getFromStorageAndCreateModal(prefModal) {
	let firstTime = preferences.breakTime === null ? true : false;
	preferences.breakTime = firstTime ? {} : preferences.breakTime;
	$('.pref-modal-text p').innerHTML += firstTime ? "Lunch break defaults to 12 p.m. and Saturdays and Sundays are default breaks. If you do not want this click \"Clear.\" " : "";
	$('.pref-modal-text p').innerHTML += "To select a break time for all of MWF, TR, or SU, double click on that time on any of those days.";

	// settings:
	let breakFormCont = document.createElement("div");
	breakFormCont.className = "form-container";

	let breakForm = document.createElement("div");
	breakForm.className = "inner-form-container";
	breakFormCont.appendChild(breakForm);


	let breakDay = []; // [M, T, W, R, F, Sa, Su]
	let dayVec = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
	for(let i = 0; i < 7; ++i) {
		breakDay[i] = document.createElement("div");
		breakDay[i].className = "break-day";

		let day = document.createElement("div");
		let cname;
		if (i !== 6 && i % 2 === 0) {
			cname = "MWF";
		} else if (i !== 5 && i % 2 === 1) {
			cname = "TR";
		} else {
			cname = "SU";
		}
		day.className = "break-day-title " + cname;

		day.id = dayVec[i];
		day.innerHTML = dayVec[i];
		breakDay[i].appendChild(day);

		let selectAll = document.createElement("div");
		let saspan = document.createElement("span");
		selectAll.className = "break-select 7";
		selectAll.id = "select-all";
		selectAll.appendChild(saspan);
		saspan.innerHTML = "Select All"
		selectAll.ondblclick = (event) => {preferenceDblClickHandler(event.target);};

		selectAll.onclick = () => {
			let key = $(selectAll).siblings(".break-day-title").attr('id');
			if (preferences.breakTime[key].length < 12) {
				preferences.breakTime[key] = [7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18];
				$(selectAll).parent().find(".break-select").removeClass("one-chosen").addClass("one-chosen");
			} else {
				preferences.breakTime[key] = [];
				$(selectAll).parent().find('.break-select').removeClass("one-chosen");
			}
		};

		breakDay[i].appendChild(selectAll);
		breakForm.appendChild(breakDay[i]);

		for(let j = 8; j <= 18; ++j) {

			let time = j % 12;
			let timeStr = "";
			if (time === 0) {
				time = 12;
			}
			if (time >= 8 && time < 11) {
				timeStr = time.toString() + "am - " + (time + 1).toString() + "am";
			} else if (time === 11) {
				timeStr = time.toString() + "am - " + (time + 1).toString() + "pm";
			} else if (time === 12) {
				timeStr = time.toString() + "pm - " + (1).toString() + "pm";
			} else {
				timeStr = time.toString() + "pm - " + (time + 1).toString() + "pm";
			}

			let breakSelect = document.createElement("div");
			let bsspan = document.createElement("span");
			breakSelect.appendChild(bsspan);
			breakSelect.className = "break-select " + j;
			bsspan.innerHTML = timeStr;
			breakSelect.onclick = () => {
				let k = $(breakSelect).siblings(".break-day-title").attr('id');
				preferences.breakTime[k].includes(j) ? preferences.breakTime[k].splice(preferences.breakTime[k].indexOf(j), 1) : preferences.breakTime[k].push(j);
 				$(breakSelect).toggleClass("one-chosen");

				// handles checking and unchecking of select all based on
				// if the rest of the items are full
				if($(selectAll).hasClass("one-chosen")) {
					$(selectAll).removeClass("one-chosen");
					preferences.breakTime[k].splice(preferences.breakTime[k].indexOf(7), 1);
				} else if ($(selectAll).hasClass("saved-preference")) {
					$(selectAll).removeClass("saved-preference");
					preferences.breakTime[k].splice(preferences.breakTime[k].indexOf(7), 1);
				} else {
					if (preferences.breakTime[k].length === 11) {
						$(selectAll).trigger('click');
					}
				}
			};
			breakSelect.ondblclick = (event) => {preferenceDblClickHandler(event.target);};
			breakDay[i].appendChild(breakSelect);
		}

		firstTime ? (preferences.breakTime[dayVec[i]] = (dayVec[i] === "Saturday" || dayVec[i] === "Sunday") ? [7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18] : [12]) : null;
		//div2.appendChild(breakDay[i]);
	}


	document.querySelector('body').appendChild(prefModal)
	$('.pref-modal-text').append(breakFormCont);


	for (let day in preferences.breakTime) {
		preferences.breakTime[day].map((time) => {
			$("#" + day).siblings("." + time.toString()).removeClass("one-chosen").addClass("one-chosen");
		});
	}

	let prefBtnCont = document.createElement("div");
	prefBtnCont.className = "pref-btn-container";
	breakFormCont.appendChild(prefBtnCont);

	let checkBoxDiv = document.createElement("div");
	let checkBox = document.createElement("input");
	let label = document.createElement("label");
	checkBoxDiv.className = "checkbox-div";
	checkBox.id = "pref-not-met";
	checkBox.type = "checkbox";
	checkBox.checked = preferences.noPrefMet ? true : false;
	checkBox.name = "pref-not-met";
	label.className = "preference-label";
	label.htmlFor = "pref-not-met";
	label.innerHTML = "Do not show schedules that conflict with break times"
	checkBoxDiv.appendChild(checkBox);
	checkBoxDiv.appendChild(label);
	prefBtnCont.appendChild(checkBoxDiv);

	checkBox.onchange = () => {
		preferences.noPrefMet = checkBox.checked;
	};

	let clearBtn = document.createElement("button");
	clearBtn.className = "myButton modalButton2 pref-clear";
	clearBtn.innerHTML = "Clear";
	prefBtnCont.appendChild(clearBtn);
	clearBtn.onclick = () => {
		$('#pref-not-met').prop('checked', false);
		$('.break-select').removeClass("one-chosen");
		for (let day in preferences.breakTime) {
			preferences.breakTime[day] = [];
		}
	};
}

/*
*	handles the double click on Preferences times
*/
function preferenceDblClickHandler(t) {
	$(t).attr('class') ? null : t = $(t).parent();
	let time = $(t).attr('class').match(/[0-9]+/)[0];
	let day = $(t).siblings('.break-day-title').attr('class').match(/\s(\w+)/)[1];
	let parent = $(t).parent().parent();
	let click_flag = $(t).hasClass('one-chosen') ? false : true;
	triggerDblClick(parent, day, time, click_flag);
}

/*
*	Triggers the click event on the proper days/times in the preferences modal
*/
function triggerDblClick(parent, days, time, click) {
		if (click) {
			$.each(parent.find('.' + days), (ind, el) => {
				if (!$(el).siblings('.' + time).hasClass('one-chosen')) {
					$(el).siblings('.' + time).trigger('click');
				}
			});
		} else {
			$.each(parent.find('.' + days), (ind, el) => {
				if ($(el).siblings('.' + time).hasClass('one-chosen')) {
					$(el).siblings('.' + time).trigger('click');
				}
			});
		}
}

/*
*	Updates the HTML view for preferences and updates prefMat
*/
function updatePreferences() {
	chrome.storage.sync.set({"pref": preferences}, () => {
		if (chrome.runtime.lastError) {
			console.error("Could not save preferences");
			window.alert("Preferences not saved. Check internet connection.");
		}
	});
}

/*
*	Clears class array and puts classes in cart in class arr
*/
function updateClassArr() {
	classArr = [];

	// adds classes in cart to class arr
	if (t) {
		clearTimeout(t);
	}
	t = setTimeout( function () {
		for (var i = 0; i < parent2.length; i++) {
			var children = parent2[i].children;
			if(children !== null) {
				addClass(parent2[i], i);
			}
		}
		ready = true;
	}, 100);
}


/*
*	Adds a button to each unique class
*/
function addBtn() {
	font =  $(".classAbbreviation").css('font-family');

	if (page === "Class Cart") {
		makeScheduleButton(focusPage[0].children[0]);
	}

	btn.style.fontFamily = font;
	$(".left").css("width", "100%");

	var clone = null;

	// adds buttons to class search page
	for (var i = 0; i < parent.length; i++) {

		var children = parent[i].children;

		// adds buttons to the page
		if(children !== null && !children[children.length - 1].id.includes("Btn")){
				clone = addClassButton.cloneNode(true);
				addClassButton.setAttribute("id", "Btn" + i.toString());
				parent[i].appendChild(addClassButton);
				var button = addClassButton.firstChild;
				addEL(addClassButton.children[0], i);
				addClassButton = clone;
		}
	}

	// adds button to class cart page
	for (var j = 0; j < parent2.length; j++) {

		var children = parent2[j].children;

		// adds buttons to the page
		if(children !== null && !children[children.length - 1].id.includes("RemoveBtn")){

				clone = addClassButton.cloneNode(true);
				addClassButton.setAttribute("id", "RemoveBtn" + j.toString());
				parent2[j].appendChild(addClassButton);
				var button = addClassButton.firstChild;
				button.className = "myButton remove";
				button.innerHTML = "Remove Class";
				addELToButton(j);
				addClassButton = clone;
		}
	}

}


/*
*	Adds event listener to add class buttons so that when clicked
*	all the sections of a class are added
*/
function addEL(button, classNumOnPage) {
	var addToCartList = document.getElementsByClassName("classTable")[classNumOnPage].getElementsByClassName("classActionButtons");
	var str = "";
	for (var i = 0; i < addToCartList.length; i++) {
		if (addToCartList[i].children[0] !== undefined) {
			str += addToCartList[i].children[0].getAttribute('onclick') + "; ";
		}
	}

	button.setAttribute("onclick", str);

}

/*
*	Makes a class "Class" and adds to an array containing all classes in the
*	schedule
*/
function addClass(_class, classNumOnPage) {

	var classAbbr = _class.children[0].innerHTML;
	classAbbr = classAbbr.replace(/:/, "");
	var classDesc = _class.children[1].innerHTML;
	var specificClass = document.getElementById("cartDiv").getElementsByClassName("classTable")[classNumOnPage];
	var sectionsList = specificClass.getElementsByClassName("classSection");
	var profsList = specificClass.getElementsByClassName("classInstructor");
	var hoursList = specificClass.getElementsByClassName("classHours");
	var daysList = specificClass.getElementsByClassName("classMeetingDays");
	var timesList = specificClass.getElementsByClassName("classMeetingTimes");
	var classBuildingList = specificClass.getElementsByClassName("classBuilding");
	var sections = [];
	var profs = [];
	var hours = [];
	var days = [];
	var times = [];
	var location = [];

	// Refines content
	for (var num = 0; num < sectionsList.length; ++num) {
		sections[num] = sectionsList[num].innerText.replace(/\s+$/, "");
		profs[num] = profsList[num].innerText.replace(/\s+$/, "");
		hours[num] = hoursList[num].innerText.replace(/\s+/g, "");
		days[num] = daysList[num].innerText.replace(/\s+$/, "");
		times[num] = timesList[num].innerText.replace(/\s+$/, "").replace(/ - /g, "-");
		location[num] = classBuildingList[num].innerText.replace(/\s+$/, "");

	}

	var newClass = new Class_(classAbbr, classDesc, sections, profs, hours, days, times, location);
	classArr.push(newClass);

}


/*
*	Adds class added img and adds a remove button -- currently unfunctional
*/
function classAdded(button) {
		button.setAttribute('class', 'myButton disabled');
		button.disabled = true;
		setTimeout(function() {
			button.innerHTML = "Added";
		}, 200);
}


/*
*	Creates the make schedule button
*/
function makeScheduleButton(parent) {
		if (!parent.querySelector("button")) {

		$('#yui-gen9').css('height', 'auto');
		var btnContainer = document.createElement("table");
		var contR = document.createElement("tr");
		var contD = [];
		for (let i = 0; i < 3; ++i) {
			contD[i] = document.createElement("td"); // 3 table cells
			contR.appendChild(contD[i]);
			contD[i].style.width = "33.333%"
		}
		btnContainer.appendChild(contR);
		contR.style.width = "100%";
		btnContainer.style.width = "97.5%";
		var button = document.createElement("button");
		contD[1].appendChild(button);

		var prefBtn = document.createElement("button");
		prefBtn.id = "preferenceBtn";
		prefBtn.innerHTML = "Preferences";
		prefBtn.className = "myButton myButton2";
		prefBtn.addEventListener("click", showPreferences);
		contD[contD.length - 1].appendChild(prefBtn);
		prefBtn.style.fontFamily = font;

		button.id = 'makeSchedBtn';
		button.className = 'myButton myButton2';
		button.style.fontFamily = font;
		button.innerHTML = "Make Schedule";
		parent.appendChild(btnContainer);
		button.addEventListener("click", makeSchedClicked);
	}
}


/*
*	When make schedule button is clicked, creates a
*	schedule array using all the classes in the cart.
*	Puts schedules into viewable modal
*/
function makeSchedClicked() {
	if (ready) {
			var sched = new Schedule(classArr);
			sched.sortClasses();
			scheduleArr = sched.scheduleArr;
			scheduleArr = sortBasedOnPreferences(scheduleArr);
			createViewableContent(scheduleArr);

		} else {
			setTimeout(makeSchedClicked, 50);
		}
}

/*
*	Shows the preferences for user to choose
*/
function showPreferences() {
	document.getElementById("pref-modal").style.display = "block";
	let width = $('#Wednesday.break-day-title').width();
	$('.break-select').css({'min-width': width});
}


/*
*	Sorts the array based on the preferences and returns the array
*/
function sortBasedOnPreferences(arr) {
	// TODO SORT THIS
	let prefNotMetCount; // number of preferences broken
	let breakArr = [];
	let t;
	let d;
	for (let day in preferences.breakTime) {
		d = day[0];
		if (d === "T") {
			d = day[1] === "h" ? d = "R" : d = "T";
		} else if (d === "S") {
			d = day[1] === "u" ? d = "U" : d = "S";
		}

		preferences.breakTime[day].forEach((time) => {
			if (time !== 7 && time < 10) {
				t = "0" + time.toString() + ":01-0" + time.toString() + ":59";
			} else {
				t = time.toString() + ":01-" + time.toString() + ":59";
			}
			breakArr.push(["CLASS ABBRV", "00", t, d]);
		});
	}
	if (preferences.noPrefMet) { // do not show if no pref met
		arr = arr.filter((sched) => {
			let flag = true;
			breakArr.forEach((c) => {
				Schedule.checkOverlap(c, sched) ? flag = false : null;
			});
			return flag;
		});
	} else {
		arr.sort((a, b) => {
			prefNotMetCount = 0;
			// a - b: negative then a is before b, 0  then same, pos then b before a
			breakArr.forEach((c) => {
				if (Schedule.checkOverlap(c, a)) {
					++prefNotMetCount; // positive: more pref not met by a so a comes after b
				}
				if (Schedule.checkOverlap(c, b)) {
					--prefNotMetCount; // negative: more pref not met by b so b comes after a
				}
			});
			return prefNotMetCount;
		});
	}
	return arr;
}


/*
*	Creates modal with different schedules and tables
*/
function createViewableContent(arr) {
	var scheduleDiv;
	if (arr.length > 0) {
		schedArr = convertToDetailed(arr);
		var bigSchedDiv = document.createElement("div");

		// creates schedule table
		schedArr.forEach(function (schedule, idx) {
			scheduleDiv = document.createElement("div");
			idx % 2 === 0 ? $(scheduleDiv).addClass('schedule-div') : $(scheduleDiv).addClass('schedule-div')
			.css('background-color', '#dedede');

			var table = document.createElement("table");
			$(table).addClass('schedule-table');
			scheduleDiv.appendChild(table);
			var caption = table.createCaption();
			var capSpan = document.createElement("span");
			var capButtonSpan = document.createElement("span");
			var pickSchedBtn = document.createElement("button");
			caption.appendChild(capSpan);
			caption.appendChild(capButtonSpan);
			capButtonSpan.appendChild(pickSchedBtn);
			capSpan.innerHTML = "Schedule #" + (idx + 1).toString();
			pickSchedBtn.className = "myButton modalButton";
			pickSchedBtn.innerHTML = "Pick Schedule";

			// Remove classes not in schedule from cart
			pickSchedBtn.addEventListener("click", () => {
				var curSched = schedArr[~~pickSchedBtn.parentNode.previousSibling.innerHTML.match(/[0-9]+/) - 1];
				var classTab = document.getElementById("studentCart").getElementsByClassName("classTable");
				for (var i = 0; i < parent2.length; i++) {
					var children = parent2[i].children;
					for (var j = 0; j < curSched.length; j++) {
						if (children[0].innerHTML.includes(curSched[j].classAbbr)) {
							for (var k = 0; k < classTab[i].getElementsByClassName("classRow").length; k++) {
								var sectionNum = classTab[i].getElementsByClassName("classRow")[k].getElementsByClassName("classSection")[0].innerHTML;
								var sectionNumStr = replaceSpaces(sectionNum);
								if(sectionNumStr !== curSched[j].sections[0]) {
									// Remove class
									var p = classTab[i].getElementsByClassName("classRow")[k]
										.getElementsByClassName("classActionButtons")[0];
									var lId = p.children[0].id;
									var l = lId.substring(lId.indexOf("Row_") + 4, lId.indexOf("_remove"));
									var newScript = document.createElement("script");
									var script = p.getElementsByTagName("script");
									var s = script[0].innerHTML;
									var scriptToAdd = "\nStudentCartList_classSectionListRow_" + l +
											"_removeSavedClassSection_onclick();\n";
									var strToInsertAfter = "YAHOO.util.Event.addListener( 'StudentCartList_classSectionListRow_"
										+ l + "_removeSavedClassSection', 'click', StudentCartList_classSectionListRow_"
										 + l + "_removeSavedClassSection_onclick );";
									var subStr = s.substring(s.indexOf(strToInsertAfter) + strToInsertAfter.length);

									newScript.innerHTML = s.substring(0, s.indexOf(strToInsertAfter) + strToInsertAfter.length)
										+ subStr.substring(0, subStr.indexOf(strToInsertAfter) + strToInsertAfter.length)
										+ scriptToAdd + subStr.substring(subStr.indexOf(strToInsertAfter) + strToInsertAfter.length);

									p.replaceChild(newScript, script[0]);
								}

							}
						}
					}


				}
				modal.style.display = "none";
				document.getElementById("modalBody").innerHTML = "";

				scheduleArr = [];
			});

			// creates table
			$(capSpan).css('font-family', font).addClass('schedule-caption');
			scheduleDiv.id = caption.innerHTML;
			var header = table.createTHead();
			var hrow = header.insertRow(0);
			for (var i = 0; i < 8; i++) {
				var hcell = document.createElement("th");
				hrow.appendChild(hcell);
				$(hcell).css('font-family', font).addClass('schedule-th');
				switch(i){
					case 0:
						hcell.innerHTML = "";
						break;
					case 1:
						hcell.innerHTML = "Mon";
						break;
					case 2:
						hcell.innerHTML = "Tues";
						break;
					case 3:
						hcell.innerHTML = "Wed";
						break;
					case 4:
						hcell.innerHTML = "Thurs";
						break;
					case 5:
						hcell.innerHTML = "Fri";
						break;
					case 6:
						hcell.innerHTML = "Sat";
						break;
					case 7:
						hcell.innerHTML = "Sun";
						break;

				}
			}

			// creates times
			var tBody = table.createTBody();
			for (var i = 0; i < 13; i++) {
				var row = tBody.insertRow(i);
				$(row).addClass('schedule-tr');
				for (var j = 0; j < 8; j++) {
					var cell = row.insertCell(j);
					$(cell).addClass('schedule-td');
					if (j === 0) {
						var timeText = i + 7 <= 12 ? (i + 7).toString() :
											((i + 7) % 13 + 1).toString();
						if ((i+7) < 12) {
							timeText += " am";
						} else {
							timeText += " pm";
						}
						cell.innerHTML = timeText;
						$(cell).addClass('c1');
					}
				}
			}
			bigSchedDiv.appendChild(scheduleDiv);
			$(scheduleDiv).css({'position': 'relative'});
		});

		$("#modalBody").append(bigSchedDiv);
		document.getElementsByClassName("modal-header")[0]
			.getElementsByTagName("h2")[0]
			.innerHTML = "Pick Schedule";
		$("#modalHeaderText").css('color', 'black');
		$(".modal-content").css('font-family', font);
		modal.style.display = "block";


		schedArr.forEach((schedule, idx) => {
		// Places class
			scheduleDiv = document.getElementsByClassName("schedule-div")[idx];
			schedule.forEach( (c) => {
				if(c.days[0] !== "TBA") {
					for (var k = 0; k < c.days[0].length; k++) {
						var classDiv = document.createElement("div");
						classDiv.className = "class";
						$(classDiv).prop('time', c.times[0]);
						$(classDiv).prop('location', c.location[0]);
						classDiv.id = c.classAbbr.replace(/\s/g, "") + "_" + k;
						var classTextDiv = document.createElement("div");
						classTextDiv.className = "classText";
						classTextDiv.innerHTML = c.classAbbr + "-" + c.sections[0];
						classDiv.appendChild(classTextDiv);
						placeClass(classDiv, scheduleDiv, c.days[0].charAt(k), c.times[0]);
						var height = Class_.lengthOfClass(c.times[0]);
						height *= (scheduleDiv.getElementsByTagName("tr")[1].offsetHeight - 2) / scheduleDiv.offsetHeight * 100;
						// 2 for the border
						$(classDiv).css('height', height.toString() + "%");
					}
				}
			});
		});
	} else {
		document.getElementsByClassName("modal-header")[0]
			.getElementsByTagName("h2")[0]
			.innerHTML = "<p>Error in creating schedule!</p><p class='errorText'>There was no possible schedule created from the classes in your cart. Try removing some classes that may overlap. Or uncheck the \"Do not show schedules that conflict with break times\" box in preferences.</p>";
		$("#modalHeaderText").css('color', 'red');
		$(".modal-content").css('font-family', font);
		modal.style.display = "block";
	}
}


/*
*	Creates detailed schedule array from the less detailed array
*/
function convertToDetailed(arr) {
	var ss = [];
	var s = [];
	var classAbbr;
	var section;
	var x, y;
	arr.forEach(function (sched) {
		sched.forEach(function (c) {
			classAbbr = c[0];
			section = c[1];
			var ind = getClass(classAbbr, section);
			x = ind[0];
			y = ind[1];
			if ((/\n/).test(x.times[y]) && (/\n/).test(x.days[y])) {
				let times = x.times[y].split(/\n/);
				let days = x.days[y].split(/\n/);
				let locations = x.location[y].split(/\n/);
				while (locations.length < days.length) {
					locations.push(locations[locations.length - 1]);
				}
				for (let i = 0; i < times.length; ++i) {
					s.push(new Class_(x.classAbbr, x.classDesc, [x.sections[y]], x.prof, [x.hours[y]], [days[i]], [times[i]], [locations[i]]));
				}
			} else {
			s.push(new Class_(x.classAbbr, x.classDesc, [x.sections[y]], x.prof, [x.hours[y]], [x.days[y]], [x.times[y]], [x.location[y]]));
			}

		});
		ss.push(s);
		s = [];
	});

	return ss;
}


/*
*	Gets the class with the class abbreviation and section from
*	the class array. Returns class and index of section
*/
function getClass(classAbbr, section) {
	for (var i = 0; i < classArr.length; i++) {
		if (classAbbr === classArr[i].classAbbr) {
			for (var j = 0; j < classArr[i].sections.length; j++) {
				if (classArr[i].sections[j] === section) {
					return [classArr[i], j];
				}
			}
		}
	}
	return null;
}


/*
*	Places class on schedule based on time and day
*/
function placeClass(classDiv, scheduleDiv, day, time) {
	var divHeight = scheduleDiv.offsetHeight;
	var divWidth = scheduleDiv.offsetWidth;
	var tab = scheduleDiv.firstChild.getElementsByTagName("tr");
	var rowHeight = tab[1].offsetHeight;
	var firstRowHeight = tab[0].offsetHeight;
	var colWidth = scheduleDiv.firstChild.getElementsByTagName("td")[0].offsetWidth - .5;
	var tablePos = $(scheduleDiv.firstChild).position();
	var tableX = tablePos.left;
	var tablePos2 = $(tab[0]).position();
	var tableY = tablePos2.top;
	if (divHeight !== 0) {
		var xDisplace;
		switch(day) {
			case "M":
				xDisplace = colWidth;
				break;
			case "T":
				xDisplace = colWidth * 2;
				break;
			case "W":
				xDisplace = colWidth * 3;
				break;
			case "R":
				xDisplace = colWidth * 4;
				break;
			case "F":
				xDisplace = colWidth * 5;
				break;
			case "S":
				xDisplace = colWidth * 6;
				break;
			case "U":
				xDisplace = colWidth * 7;
				break;
		}
		time = time.substring(0, time.indexOf("-"));
		var h, m;
		if (time.indexOf("p") >= 0 && time.substring(0, 2) !== "12") {
			h = ~~time.substring(0, 2) + 12;
		} else {
			h = ~~time.substring(0, 2);
		}
		h -= 7; // 7am = 0
		m = ~~time.substring(time.indexOf(":") + 1, time.indexOf(":") + 3);
		m /= 60;
		var yDisplace = (h + m) * rowHeight + firstRowHeight;
		var x = ((xDisplace + tableX) / divWidth) * 100 + ((colWidth / divWidth) * 100 - 10) / 2;
		var y = ((yDisplace + tableY) / divHeight) * 100;

		$(classDiv).css('top', y.toString() + "%");
		$(classDiv).css('left', x.toString() + "%");


		// adds detailed comment bubble on hover
		var commentDiv = document.createElement("div");
		commentDiv.className = "comment-div";
		var commentImg = document.createElement("img");
		var iconUrl2 = chrome.extension.getURL("comment-pic2.png");
		var iconUrl3 = chrome.extension.getURL("comment-pic3.png");
		if($(scheduleDiv).css('background-color').toString() === "rgb(222, 222, 222)") {
			$(commentImg).attr("src", iconUrl3);
		} else {
			$(commentImg).attr("src", iconUrl2);
		}
		commentImg.className = "comment-img";
		$(commentDiv).css('left', x.toString() + "%");
		commentDiv.appendChild(commentImg);
		scheduleDiv.appendChild(commentDiv);


		var upperLeftText = document.createElement("div");
		upperLeftText.innerHTML = "Cannot display additional information."
		upperLeftText.className = "comment-text";
		commentDiv.appendChild(upperLeftText);
		$(upperLeftText).css('font-family', font);

		for (var i = 0; i < schedArr.length; i++) {
			if (scheduleDiv.id.includes(i+1)) {
				for (var j = 0; j < schedArr[i].length; j++) {
					if (classDiv.firstChild.innerHTML.includes(schedArr[i][j].classAbbr + "-" + schedArr[i][j].sections[0])) {
						upperLeftText.innerHTML = classDiv.firstChild.innerHTML + "<br/>" + $(classDiv).prop('time')
							 + "&emsp;" + $(classDiv).prop('location') + "<br/>" + schedArr[i][j].prof[0];
					}
				}
			}
		}


		// displays when hovered over class div
		classDiv.onmouseover = (event) => {
			commentDiv.style.display = "block";
			var curClassDiv;
			if (event.target.className === "class") {
				curClassDiv = event.target;
			} else {
				curClassDiv = event.target.parentNode;
			}

			var topOfClass = $(curClassDiv).css('top');
			var topOfClass2 = parseFloat(topOfClass);
			$(commentDiv).css('top', (topOfClass2 - commentDiv.offsetHeight-.5).toString() + "px");

			// minimizes comment and class placement to within .5px
			var dist = parseFloat($(commentDiv).css('top')) + parseFloat(commentDiv.offsetHeight) - parseFloat(topOfClass2);
			while (dist > .5) {
				$(commentDiv).css('top', (parseFloat($(commentDiv).css('top')) - .1).toString() + "px");
				dist = parseFloat($(commentDiv).css('top')) + parseFloat(commentDiv.offsetHeight) - parseFloat(topOfClass2);
			}
			while (dist < -.5) {
				$(commentDiv).css('top', (parseFloat($(commentDiv).css('top')) + .1).toString() + "px");
				dist = parseFloat($(commentDiv).css('top')) + parseFloat(commentDiv.offsetHeight) - parseFloat(topOfClass2);
			}

		};
		classDiv.onmouseout = function () {
			commentDiv.style.display = "none";
		};

	}
	scheduleDiv.appendChild(classDiv);

}


/*
*	Replaces only the leading spaces in a string
*/
function replaceLeadingSpaces(str) {
	var rateMyProf = "";
	if (str.indexOf("-") !== -1) {
		rateMyProf = str.substring(str.indexOf("-"));
		str = str.substring(0, str.indexOf("-"));
	}

	str = str.replace(/\n/g, "");
	var i = str.indexOf(" ");
	while(i === 0) {
		str = str.substring(i+1);
		i = str.indexOf(" ");
	}


	while (i !== -1 && str.charAt(i-1) !== " " && str.charAt(i+1) !== " ") {
		str = str.substring(0, i) + "?" + str.substring(i+1);
		i = str.indexOf(" ");
	}

	if(i > 0) {
		str = str.substring(0, i);
	}

	str = str.replace(/\?/g, " ") + " " + rateMyProf;

	if (str.indexOf("<br>") !== -1) {
		str = str.substring(0, str.indexOf("<br>"));
	}
	return str;
}


/*
*	Takes a string and removes all spaces and HTML elements
*/
function replaceSpaces(str) {
	str = str.replace(/\s+/g, "");

	while (str.indexOf("<") != -1) {
		var begIndex = str.indexOf("<");
		var endIndex = str.indexOf(">");
		str = str.substring(0, begIndex) + str.substring(endIndex+1);
	}
	return str;
}


/*
*	Prints class array to console
*/
function printAllClasses() {
	var str = "";
	classArr.forEach(function(element) {
		str += element.printClass();
	});
	console.log(str);
}


/*
*	Adds event listener to remove class button to remove
*	all sections of a class
*/
function addELToButton(i) {
	var k = 0;
	var classTable = document.getElementById("studentCart").getElementsByClassName("classTable"); //one class containing multiple sections
	if (classTable[i] !== undefined) {
		var p = classTable[i].getElementsByClassName("classActionButtons"); // all

		for(var a = 0; a < i; a++) {
			for(var b = 0; b < classTable[a].getElementsByClassName("classActionButtons").length; b++) {
				k++;
			}
		}

		document.getElementById("RemoveBtn" + i.toString()).onclick = function () {
			for (var j = 0; j < p.length; j++) {
				var newScript = document.createElement("script");
				var script = p[j].getElementsByTagName("script");
				var s = script[0].innerHTML;
				var scriptToAdd = "\nStudentCartList_classSectionListRow_" + k.toString() +
						"_removeSavedClassSection_onclick();\n";
				var strToInsertAfter = "YAHOO.util.Event.addListener( 'StudentCartList_classSectionListRow_"
					+ k.toString() + "_removeSavedClassSection', 'click', StudentCartList_classSectionListRow_"
					 + k.toString() + "_removeSavedClassSection_onclick );";
				var subStr = s.substring(s.indexOf(strToInsertAfter) + strToInsertAfter.length);

				newScript.innerHTML = s.substring(0, s.indexOf(strToInsertAfter) + strToInsertAfter.length)
					+ subStr.substring(0, subStr.indexOf(strToInsertAfter) + strToInsertAfter.length)
					+ scriptToAdd + subStr.substring(subStr.indexOf(strToInsertAfter) + strToInsertAfter.length);

				p[j].replaceChild(newScript, script[0]);
				k++;
			}
			return false;
		}
	}
}