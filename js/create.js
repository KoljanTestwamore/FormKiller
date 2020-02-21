
function createInputItem() {
    const inputs = [];
    const mainList = $(".main-list")[0];
    const container = createElement({
        class: "block-inputcreator ",
        parent: mainList
    });
    const input = createElement({
        type: "input",
        class: "block-input",
        parent: container
    });
    const cancel = createElement({
        type: "p",
        class: "cancel-icon",
        text: '✕',
        parent: container
    });
    const radioTurnOn = createElement({
        type: "p",
        class: "cancel-icon",
        text: 'R',
        parent: container
    });
    
    const reqOn = createElement({
        type: "p",
        class: "cancel-icon",
        text: 'req',
        parent: container
    })
    cancel.onclick = ()=>{
        input.value = '';
        mainList.removeChild(container);
    }
    let radio = false;
    let required = {value:false};
    let radios = [];
    let addsmallItem;
    radioTurnOn.onclick = () => {
        if (radio) {
            radio = false;
            for (const el of radios) {
                container.removeChild(el);
            }
            container.removeChild(addsmallItem);
            radios = []
        } else {
            radio = true;
            addsmallItem = createElement({
                class: '.add-button .small',
                parent: container,
                type: "button",
                text: 'Add new item'
            })

            addsmallItem.onclick = () => {
                const resultInp = createElement({
                    type: "input",
                    class: "block-input",
                    parent: container
                })
                radios.push(resultInp)
            }
        }
    }
    reqOn.onclick = () => {
        if (required.value){
            reqOn.textContent = 'req'
            required.value = false
        }
        else {
            reqOn.textContent = 'req*'
            required.value = true
        }
    }
    if (!radio)
        inputs.push(input);
    else 
        inputs.push({
            value: radios.reduce((acc,cur)=>{
                acc.concat([cur.value])
            },[])
        })
    return {
        input,
        radio,
        radios,
        required
    }
	return input;
};

function createLink(id) {
    createElement({
        type: 'a',
        parent: $('.main-list')[0],
        href: 'form.html#' + id,
        text: 'Your form'
    })
}

const inputs = [];

/*global FormKiller _config*/

var FormKiller = window.FormKiller || {};

(function createScopeWrapper($) {
    var authToken;
    FormKiller.authToken.then(function setAuthToken(token) {
        if (token) {
            authToken = token;
        } else {
            //window.location.href = '/signin.html';
        }
    }).catch(function handleTokenError(error) {
        alert(error);
        //window.location.href = '/signin.html';
    });
/*
Data - массив объектов с ссылками на раидос и инпут 
*/
    function createForm(data) {
        console.log(data)
        const result = [];
        let flag = true
        for (const elem of data) {
            let el;
            if (elem.radios.length) {
                el = elem.radios
                console.log('Here!', el)
                const radio = []
                for (const i of el) {
                    radio.push(i.value)
                }
                    result.push({
                        radio,
                        value: elem.input.value,
                    });
            } else {
                el = elem.input
                if (el.value) {
                    result.push({
                        value: el.value,
                        required: elem.required

                    });
                    el.value = '';
                }
            }
        }
        if (!flag) {
            notificate('Empty form!')
            return
        }
        console.log(result)
        $.ajax({
            method: 'POST',
            url: _config.api.invokeUrl + '/create',
            headers: {
                Authorization: authToken
            },
            data: JSON.stringify({
                data: result,
                authorID: authToken
            }),
            contentType: 'application/json',
            success: completeRequest,
            error: function ajaxError(jqXHR,     textStatus, errorThrown) {
                console.error('Error creating form: ', textStatus, ', Details: ', errorThrown);
                console.error('Response: ', jqXHR.responseText);
            }
        });
    }

    function completeRequest(result) {
        createLink(result.id);
        notificate('Created')
        console.log(result.id);
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
