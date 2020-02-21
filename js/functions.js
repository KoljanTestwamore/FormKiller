
/**
 * Takes data as object, returns created element
 */
function createElement(params) {
	const result = document.createElement(params.type || "div");
	result.className = params.class || "";
	result.textContent = params.text || "";
	result.style = params.style || {};
	result.placeholder = params.placeholder || "";
	params.parent && params.parent.appendChild(result);
	result.href = params.href || "";
	result.type = params.ttype || "";
	result.for = params.for || "";
	result.value = params.value || "";
	return result;
}


/**
 * Creates beautiful notification with given text
 */
function notificate(text, useCustomTimeout) {
	const n = createElement({
		text,
		class: 'form-notification',
		parent: document.body
	});
	if (!useCustomTimeout)
		setTimeout(()=>{
			n.style = "display:none";
		}, 1000) 
	else 
		return () => {
			n.style = "display:none"
		}
}