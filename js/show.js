/**
 * Takes array of strings, returns function that validates input values
 */
function createTableFrom(data) {
	console.log(data)
	const dict = {};
	for (const el of data) {
		if (dict[JSON.stringify(el.body)]) {
			dict[JSON.stringify(el.body)].push({
				el: el.el,
				body: el.id
			})
		} else {
			dict[JSON.stringify(el.body)] = [{
				el: el.el || '',
				body: el.id
			}]
		}
	};
	console.log(dict);
	for (const el in dict) {
		console.log(dict[el][0])
		const mainList = $(".main-list")[0];
		const header = createElement({
			type: 'a',
			parent: mainList,
			href: 'form.html#' + dict[el][0].body,
			text: 'Form ' + el
		});
		const container = createElement({
			class: "block-container",
			text: dict[el].reduce((acc, cur)=>{
				return acc+=cur.el+"\n"
			}, ""),
			parent: mainList
		});
		const separator = createElement({
			parent: mainList,
			type: 'br'
		})
	}
	return dict
}

/*global FormKiller _config*/

(function createScopeWrapper($) {
	var authToken;
    FormKiller.authToken.then(function setAuthToken(token) {
        if (token) {
            authToken = token;
        } else {
            window.location.href = '/signin.html';
        }
    }).catch(function handleTokenError(error) {
        alert(error);
        window.location.href = '/signin.html';
	});
	
    function downloadForms(authorID) {
		const hideRefresh = notificate('Loading form', true);
		console.log(JSON.stringify({
			authorID,
		}))
        $.ajax({
            method: 'PUT',
			url: _config.api.invokeUrl + '/response',
            headers: {
                Authorization: authToken
            },
            data: JSON.stringify({
				authorID,
			}),
            contentType: 'application/json',
            success: (response)=>{
				hideRefresh();
				createTableFrom(response.results, true)
				console.log(response);
			},
            error: function ajaxError(jqXHR, textStatus, errorThrown) {
				hideRefresh();
				notificate("Error.", true)
                console.error('Error creating form: ', textStatus, ', Details: ', errorThrown);
                console.error('Response: ', jqXHR.responseText);
            }
        });
	};

    // Register click handler for #request button
    $(function onDocReady() {
		downloadForms(authToken);
    });
}(jQuery));

