/**
* @namespace Rmg
**/
var Rmg = Rmg || {};
Rmg.Einvoices = Rmg.Einvoices || {};
Rmg.Einvoices.Utils = Rmg.Einvoices.Utils || {};

Rmg.Einvoices.Utils.togglePlusMinus = function(elementId) {
    var element = document.getElementById(elementId);
    if (element.classList.contains("fa-plus-circle")) { 
        element.classList.remove("fa-plus-circle");
        element.classList.add("fa-minus-circle");
    } else if (element.classList.contains("fa-minus-circle")) { 
        element.classList.remove("fa-minus-circle");
        element.classList.add("fa-plus-circle");
    } else {
        element.classList.add("fa","fa-minus-circle");
    }
}
Rmg.Einvoices.Utils.togglePlusMinusAndCollapse = function(toggleId,collapseId) {
    var collapse = document.getElementById(collapseId);
    var toggle = document.getElementById(toggleId);

    if (toggle.classList.contains("fa-plus-circle")) { 
        toggle.classList.remove("fa-plus-circle");
        toggle.classList.add("fa-minus-circle");
        collapse.classList.remove("w3-hide");
    } else { 
        toggle.classList.remove("fa-minus-circle");
        toggle.classList.add("fa-plus-circle");
        collapse.classList.add("w3-hide");
    } 
}

Rmg.Einvoices.Utils.hideElement = function(hideId,showId) {
    console.log(hideId)
    console.log(showId)
    var hide = document.getElementById(hideId);
    hide.classList.add("w3-hide");
    var show = document.getElementById(showId);
    show.classList.remove("w3-hide");
    }

    Rmg.Einvoices.Utils.toggleShowHide = function(elementId) {
        var element = document.getElementById(elementId);
        if (element.classList.contains("w3-hide")) { 
            element.classList.remove("w3-hide");
            element.classList.add("w3-show");
        } else if (element.classList.contains("w3-show")) { 
            element.classList.remove("w3-show");
            element.classList.add("w3-hide");
        } else {
            element.classList.add("w3-show");
        }
    }




