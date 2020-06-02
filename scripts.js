class DeviceItem extends HTMLLIElement {
	/**
	 * Represents a Device card
	 * @param {Object} props the props for the Device Card
	 * @param {boolean} props.loading whether the device is waiting on data
	 * @param {string} props.device the device
	 * @param {string} props.description the description of the device, or if still loading, 'Loading'
	 */
	constructor(props) {
		super();
		
		this.setAttribute('class', 'device-card');
		this.setAttribute('style', `border-left: 5px solid ${certaintyToHex(props.certainty)}`);

		if (props.loading) {
			let dots = 1;
			let dDots = 1;
			this.interval = setInterval(() => {
				this.innerHTML = `
					<div class = "certainty">${(props.certainty * 100).toFixed(0)}%</div>
					<div class = "head">
						<h3>${props.device}${'.'.repeat(dots)}</h3>
						<small>${props.num}</small>
					</div>
					<p>${props.description}${'.'.repeat(dots)}</p>
				`;
				dots += dDots;
				if (dots === 3 || dots === 0) {
					dDots = -dDots;
				}
			}, 333);
		}
		else {
			this.innerHTML = `
				<div class = "certainty">${(props.certainty * 100).toFixed(0)}%</div>
				<div class = "head">
					<h3>${props.device}</h3>
					<small>${props.num}</small>
				</div>
				<p>${props.description}</p>
			`;
		}
	}

	disconnectedCallback() {
		clearInterval(this.interval);
	}
}

class DeviceList extends HTMLDivElement {
	constructor() {
		super();

		this.innerHTML = `
			<ul class = "device-col"></ul>
		`;
	}

	connectedCallback() {
		const numDevices = Math.floor(Math.random() * 14 + 1);
		const certainties = [];

		for (let i = 0; i < numDevices; i++) {
			const certainty = Math.random();

			certainties.push(certainty);
		}

		const thisDiv = this.querySelector('ul.device-col');
		certainties.sort((a, b) => b - a);
		const devices = certainties.map((certainty, index) => {
			const device = new DeviceItem({
				certainty,
				device: 'Loading',
				description: 'Loading',
				num: index + 1,
				loading: true
			});
			thisDiv.appendChild(device);
			return device;
		});
		const promises = certainties.map(() => {
			return new Promise((resolve) => {
				const timeout = setTimeout(() => {
					resolve({
						data: ['Sorry the requested data failed to load...']
					});
				}, 7500);
				if (typeof window.axios !== 'undefined') {
					axios.get('https://baconipsum.com/api/?type=meat-and-filler&sentences=1')
						.then((res) => {
							resolve(res);
							clearTimeout(timeout);
						})
						.catch((err) => {
							reject(err);
							clearTimeout(timeout);
						});
				}
				else {
					fetch('https://baconipsum.com/api/?type=meat-and-filler&sentences=1').then((res) => res.json())
						.then((res) => {
							resolve(res);
							clearTimeout(timeout);
						})
						.catch(() => {
							resolve(['Sorry the requested data failed to load...']);
							clearTimeout(timeout);
						});
				}
			});
		});

		Promise.all(promises)
			.then((values) => {
				values.forEach((res, index) => {
					const tokens = typeof window.axios !== 'undefined' ? res.data[0].split(' ') : res[0].split(' ');
					const newDevice = new DeviceItem({
						certainty: certainties[index],
						device: tokens[0],
						description: tokens.slice(1, tokens.length <= 7 ? tokens.length : 7).join(' '),
						num: index + 1,
						loading: false
					});
					devices[index].remove();
					thisDiv.appendChild(newDevice);
				});
			})
			.catch((err) => {
				console.log(err);
			});
	}
}

customElements.define('device-item', DeviceItem, { extends: 'li' });
customElements.define('device-list', DeviceList, { extends: 'div' });


/*********************\
 * Utility functions *
\*********************/

/**
 * Gets the "props" (attributes) of an element
 * @param {HTMLElement} elem the element to get "props" for
 * @returns {any} the attributes of the element, as an object
 */
function getProps(elem) {
	const props = {};
	for (let name of elem.getAttributeNames()) {
		props[name] = elem.getAttribute(name);
	}
	return props;
}

/**
  * Generates a hex code to style the card for the device from the certainty of the identifier
  * @param {number} certainty Certainty of the recognition, from 0 to 1
  * @returns {string} the hex code for the css color
  */
function certaintyToHex(certainty) {
	 const r = Number((255 * (1 - certainty)).toFixed(0)).toString(16);
	 const g = Number((255 * certainty).toFixed(0)).toString(16);
	return `#${(r.length === 1 ? '0' + r : r) + (g.length === 1 ? '0' + g : g)}00`;
}