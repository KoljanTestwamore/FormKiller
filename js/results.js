/*global FormKiller _config*/

var FormKiller = window.FormKiller || {};

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

    function createForm(data) {
        for (const el of data) 
                el.value && result.push(el.value);
        console.log(result)

        $.ajax({
            method: 'POST',
            url: _config.api.invokeUrl + '/create',
            headers: {
                Authorization: authToken
            },
            data: JSON.stringify(result),
            contentType: 'application/json',
            success: completeRequest,
            error: function ajaxError(jqXHR, textStatus, errorThrown) {
                console.error('Error requesting ride: ', textStatus, ', Details: ', errorThrown);
                console.error('Response: ', jqXHR.responseText);
                alert('An error occured when requesting your unicorn:\n' + jqXHR.responseText);
            }
        });
    }

    function completeRequest(result) {
        console.log('Response received from API: ', result);
    }

    // Register click handler for #request button
    $(function onDocReady() {
        $('.create-button').click(handleRequestClick);
        $('.add-button').click(()=>{
            inputs.push(createInputItem());
        })
    });

    function handleRequestClick(event) {
        event.preventDefault();
        createForm(inputs);
    }
}(jQuery));
