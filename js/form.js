


/**
 * Takes array of strings, returns function that validates input values
 */
function makeFormFromArray(data) {
	console.log(data)
	const textandinput = [];
	let ress = "";
	for (const e in data) {
		const el = JSON.parse(data[e]);
		console.log(el)
		const mainList = $(".main-list")[0];
		const container = createElement({
			class: "block-container",
			parent: mainList
		});
		const header = createElement({
			class: "block-header",
			text: el.value + ((el.required && el.required.value) ? '*' : '') + ":",
			parent: container
		});
		const input = createElement({
			type: "input",
			class: "block-input",
			placeholder: "Answer",
			parent: container
		});
		if (el.required && el.required.value) {
			input.required = true
		}
		if (el.radio) {
			input.style = 'display:none';
			const buttons = [];
			for (const elem of el.radio) {
				if (ress == "") {
					ress = elem;
				}
				const button = createElement({
					type: "button",
					text: elem,
					parent: container
				});
				button.onclick = ()=>{
					buttons.forEach((item)=>{
						item.style = ""
					})
					button.style = "background-color:gray"
					ress = elem
				}
				buttons.push(button)
			}
			//ress = buttons[0].text
			buttons[0].style = "background-color:gray"
			
		}
		textandinput.push({
			input,
			header: el.value,
			ress,
			radio: el.radio || false
		});
	}

	return function() {
		const result = {};
		console.log(textandinput)
		for (const el of textandinput) {
			if (!el.radio) {
				result[el.header] = el.input.value;
				if ((el.input.required) && (el.input.value == ""))
					return
			}
			else 
				result[el.header] = ress
		}
		for (const el of textandinput)
			el.input.value = '';
		console.log(result)
		return result;
	};
}

/*global FormKiller _config*/

(function createScopeWrapper($) {
	let submit = () => {};
    function downloadForm(hash) {
		const hideRefresh = notificate('Loading form', true);
		console.log(JSON.stringify({
		}))
        $.ajax({
            method: 'PUT',
            url: _config.api.invokeUrl + '/form',
            data: JSON.stringify({
				Id: hash,
			}),
            contentType: 'application/json',
            success: (response)=>{
				hideRefresh();
				submit = makeFormFromArray(response.results);
			},
            error: function ajaxError(jqXHR, textStatus, errorThrown) {
				hideRefresh();
				notificate("Error.", true)
                console.error('Error creating form: ', textStatus, ', Details: ', errorThrown);
                console.error('Response: ', jqXHR.responseText);
            }
        });
	};
	
	function sendResponse(data, id) {
		console.log(data)
		$.ajax({
            method: 'POST',
            url: _config.api.invokeUrl + '/form',
            data: JSON.stringify({
				id,
				data
			}),
            contentType: 'application/json',
            success: (response)=>{
				notificate("Form sent");
				console.log(response)
			},
            error: function ajaxError(jqXHR, textStatus, errorThrown) {
				notificate("Error accured")
                console.error('Error creating form: ', textStatus, ', Details: ', errorThrown);
                console.error('Response: ', jqXHR.responseText);
            }
        });
	}

    // Register click handler for #request button
    $(function onDocReady() {
		if (window.location.hash){
			downloadForm(window.location.hash.slice(1));
			console.log(window.location.hash.slice(1))
			$('.create-button').click(handleRequestClick);
			$('.submit-button').click(()=>{
				const res = submit();
				for (const item in res) {
					if (res[item] != '') {	
						console.log(res[item]);
						sendResponse(res, window.location.hash.slice(1));
						return;
					}
				} 
				notificate('Smth wrong')
			})
		} else {
			console.log('something wrong with your url')
		}
    });

    function handleRequestClick(event) {
        event.preventDefault();
        createForm(inputs);
    }
}(jQuery));

