let participants = [];
let balancesElem = null;

document.addEventListener("DOMContentLoaded", function (){
	const participantsGrid = document.getElementById("participantsGrid");
	const addParticipant = document.getElementById("addParticipant");
	
	const expensesList = document.getElementById("expensesList");
	const addExpense = document.getElementById("addExpense");
	
	balancesElem = document.getElementById("balances");
	
	document.getElementById("shareButton").addEventListener("click", async () => {
		try {
			await navigator.clipboard.writeText(location.href);
		} catch (err) {
			console.error(err);
			alert("Couldn't copy the link.");
		}
	});
	
	function addNewParticipant(name = undefined){
		if(name === undefined && participants.some(p => p.name === "")){
			return;
		}
		
		const pocket = document.createElement("div");
		pocket.className = "orangePocket";
		
		const input = document.createElement("input");
        input.type = "text";
        input.placeholder = "Name";
        input.className = "orangeInput";
		if(name !== undefined){
			input.value = name;
		}
		
		input.addEventListener("keydown", function(e) {
			if(e.key === "Enter"){
				e.preventDefault(); //block actual newline
				addNewParticipant();
			}
		});
		
		const remove = document.createElement("button");
        remove.className = "orangeSmallButton";
        remove.textContent = "✕";
		
		const participantObj = {name: name ?? ""};
		participants.push(participantObj);
		updateParticipants();
		
		remove.addEventListener("click", () => {
            animateGridChange(participantsGrid, () => {
				pocket.classList.remove("show");
				pocket.remove();
				participants = participants.filter(p => p !== participantObj);
				updateParticipants();
			}, true, false);
        });
		
		pocket.append(input, remove);
		
		input.addEventListener("input", () => {
			participantObj.name = input.value.trim();
			updateParticipants();
		});
		
		animateGridChange(participantsGrid, () => {
			participantsGrid.insertBefore(pocket, addParticipant);
		}, true, false);
		
		//Trigger the fade-in animation.
        requestAnimationFrame(() => {
            pocket.classList.add("show");
        });
		
		if(name === undefined){
			input.focus();
			
			addParticipant.scrollIntoView({
				behavior: "smooth",
				block: "nearest"
			});
		}
	}
	
	function addNewExpense(data = undefined){
		const card = document.createElement("div");
		card.className = "orangeCard";
	
		// Delete button
		const remove = document.createElement("button");
		remove.className = "orangeSmallButton deleteExpense";
		remove.textContent = "✕";
	
		remove.addEventListener("click", () => {
			animateGridChange(expensesList, () => {
				card.classList.remove("show");
				card.remove();
				updateBalances();
			}, false, true);
		});
	
		card.appendChild(remove);
	
		// Description
		const descriptionLabel = document.createElement("label");
		descriptionLabel.textContent = "Description";
	
		const descriptionInput = document.createElement("input");
		descriptionInput.className = "orangeInput";
		descriptionInput.type = "text";
		descriptionInput.placeholder = "Description";
		if(data !== undefined){
			descriptionInput.value = data.desc;
		}
	
		card.append(descriptionLabel, descriptionInput);
	
		// Amount + Paid by row
		const row = document.createElement("div");
		row.className = "expenseRow";
	
		// Amount
		const amountField = document.createElement("div");
		amountField.className = "expenseField";
	
		const amountLabel = document.createElement("label");
		amountLabel.textContent = "Amount";
	
		const amountInput = document.createElement("input");
		amountInput.className = "orangeInput";
		amountInput.type = "number";
		amountInput.step = "0.1";
		amountInput.min = "0";
		amountInput.placeholder = "0.00";
		if(data !== undefined){
			amountInput.value = data.amount;
		}
		
		amountInput.addEventListener("input", () => {
			updateBalances();
		});
		
		descriptionInput.addEventListener("keydown", function(e) {
			if(e.key === "Enter"){
				e.preventDefault(); //block actual newline
				amountInput.focus();
			}
		});
		
		descriptionInput.addEventListener("input", () => {
			updateUrl();
		});
	
		amountField.append(amountLabel, amountInput);
	
		// Paid by
		const paidByField = document.createElement("div");
		paidByField.className = "expenseField";
	
		const paidByLabel = document.createElement("label");
		paidByLabel.textContent = "Paid by";
	
		const paidBySelect = document.createElement("select");
		paidBySelect.className = "orangeInput";
	
		participants.forEach(p => {
			const option = document.createElement("option");
			option.textContent = p.name;
			option._participant = p;
			paidBySelect.appendChild(option);
		});
		
		if(data !== undefined){
			for(const option of paidBySelect.options){
				if(option._participant === data.paidBy){
					option.selected = true;
					break;
				}
			}
		}
		
		paidBySelect.addEventListener("change", () => {
			updateBalances();
		});
	
		paidByField.append(paidByLabel, paidBySelect);
	
		row.append(amountField, paidByField);
	
		card.appendChild(row);
	
		// Split between
		const splitLabel = document.createElement("label");
		splitLabel.textContent = "Split between";
	
		const splitContainer = document.createElement("div");
		splitContainer.className = "expenseParticipants";
	
		// TODO: Populate from participants list
		participants.forEach(p => {
			const label = document.createElement("label");
			label.className = "expenseParticipant";
	
			const checkbox = document.createElement("input");
			checkbox.type = "checkbox";
			checkbox.className = "orangeCheckbox";
			if(data !== undefined){
				checkbox.checked = data.split.includes(p);
			}else{
				checkbox.checked = true;
			}
			
			checkbox.addEventListener("change", () => {
				updateBalances();
			});
			
			checkbox._participant = p;
	
			label.append(checkbox, document.createTextNode(p.name));
	
			splitContainer.appendChild(label);
		});
	
		card.append(splitLabel, splitContainer);
		
		card._paidBySelect = paidBySelect;
		card._splitContainer = splitContainer;
		card._amount = amountInput;
		card._description = descriptionInput;
	
		animateGridChange(expensesList, () => {
			expensesList.insertBefore(card, addExpense);
		}, false, true);
		
		//Trigger the fade-in animation.
        requestAnimationFrame(() => {
            card.classList.add("show");
        });
		
		if(data === undefined){
			descriptionInput.focus();
			
			addExpense.scrollIntoView({
				behavior: "smooth",
				block: "nearest"
			});
		}
	}
	
	addParticipant.addEventListener("click", () => addNewParticipant());
	addExpense.addEventListener("click", () => addNewExpense());
	
	//URL laoding
	const params = new URLSearchParams(location.search);
	if (params.has("data")){
		const data = JSON.parse(decodeURIComponent(params.get("data")));
	
		// Participants
		for(const name of data.p){
			addNewParticipant(name);
		}
	
		// Expenses
		for(const expense of data.e){
			addNewExpense({
				desc: expense[0],
				amount: expense[1],
				paidBy: participants[expense[2]],
				split: expense[3].map(i => participants[i])
			});
		}
		
		//Update page
		updateBalances();
	}else{
		addNewExpense();
		addNewParticipant();
	}
});

function animateGridChange(container, change, horizontal = true, vertical = true) {
    // Record children positions
    const positions = new Map();
    for (const child of container.children) {
        positions.set(child, child.getBoundingClientRect());
    }

    // Apply change
    change();

    // Animate children
    for (const child of container.children) {
        const oldPos = positions.get(child);
        if (!oldPos) continue;

        const newPos = child.getBoundingClientRect();

        const dx = horizontal ? oldPos.left - newPos.left : 0;
        const dy = vertical ? oldPos.top - newPos.top : 0;

        if (dx || dy) {
            child.animate(
                [
                    { transform: `translate(${dx}px, ${dy}px)` },
                    { transform: "translate(0,0)" }
                ],
                {
                    duration: 200,
                    easing: "ease"
                }
            );
        }
    }
}

function updateParticipants(){
    document.querySelectorAll(".orangeCard").forEach(card => {
        const paidBySelect = card._paidBySelect;
        const splitContainer = card._splitContainer;

        // Save current paid participant
        const oldPaid = paidBySelect.selectedOptions[0]?._participant;

        // Update dropdown
        paidBySelect.replaceChildren();

        participants.forEach(p => {
            const option = document.createElement("option");
            option.textContent = p.name;
            option._participant = p;

            if (p === oldPaid)
                option.selected = true;

            paidBySelect.appendChild(option);
        });


        // Save checked participants
        const oldUnChecked = new Set();

        splitContainer.querySelectorAll("input").forEach(checkbox => {
            if(!checkbox.checked)
                oldUnChecked.add(checkbox._participant);
        });


        // Update checkboxes
        splitContainer.replaceChildren();

        participants.forEach(p => {
            const label = document.createElement("label");
            label.className = "expenseParticipant";

            const checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.className = "orangeCheckbox";
            checkbox.checked = !oldUnChecked.has(p);
            checkbox._participant = p;
			
			checkbox.addEventListener("change", () => {
				updateBalances();
			});

            label.append(
                checkbox,
                document.createTextNode(p.name)
            );

            splitContainer.appendChild(label);
        });
    });
	
	updateBalances();
}

//ALSO UPDATE URL
function updateBalances(){
	const net = new Map();
	
	for(const p of participants){
		net.set(p, 0);
	}
	
	//URL
	let urlGen = {
		p: participants.map(p => p.name),
		e: []
	};
	
	document.querySelectorAll(".orangeCard").forEach(card => {
		const paidBy = card._paidBySelect.selectedOptions[0]?._participant;
		const amount = parseFloat(card._amount.value) || 0;

		// Save checked participants
		const usedBy = new Set();

		card._splitContainer.querySelectorAll("input").forEach(checkbox => {
			if(checkbox.checked)
				usedBy.add(checkbox._participant);
		});
		
		//URL
		const urlExp = [
			card._description.value,
			amount,
			participants.indexOf(paidBy),
			Array.from(usedBy, p => participants.indexOf(p))
		];
		urlGen.e.push(urlExp);
		
		if(usedBy.size === 0){
			return;
		}
		
		const share = amount / usedBy.size;
		
		net.set(paidBy, net.get(paidBy) + amount);
		
		usedBy.forEach(u => {
			net.set(u, net.get(u) - share);
		});
	});
	
	const debtors = [];
	const creditors = [];
	const epsilon = 0.005;
	
	for(const [p, value] of net){
		if(value > epsilon){
			creditors.push({p, amount: value});
		}else if(value < -epsilon){
			debtors.push({p, amount: -value});
		}
	}
	
	//Sort for optimality
	creditors.sort((a, b) => b.amount - a.amount);
	debtors.sort((a, b) => b.amount - a.amount);
	
	balancesElem.innerHTML =`<h2 class="orangeTitle">Balances</h2>`;
	
	let i = 0, j = 0;
	while(i < debtors.length && j < creditors.length){
		const pay = Math.min(debtors[i].amount, creditors[j].amount);
		
		balancesElem.innerHTML += debtors[i].p.name + " <i>→</i> " + creditors[j].p.name + ":   " + pay.toFixed(2) + "<br>";
	
		debtors[i].amount -= pay;
		creditors[j].amount -= pay;
	
		if (debtors[i].amount < 0.005) i++;
		if (creditors[j].amount < 0.005) j++;
	}
	
	//URL
	const encoded = encodeURIComponent(JSON.stringify(urlGen));
	history.replaceState(null, "", "?data=" + encoded);
}

//ONLY URL
function updateUrl(){
	//URL
	let urlGen = {
		p: participants.map(p => p.name),
		e: []
	};
	
	document.querySelectorAll(".orangeCard").forEach(card => {
		const paidBy = card._paidBySelect.selectedOptions[0]?._participant;
		const amount = parseFloat(card._amount.value) || 0;

		// Save checked participants
		const usedBy = new Set();

		card._splitContainer.querySelectorAll("input").forEach(checkbox => {
			if(checkbox.checked)
				usedBy.add(checkbox._participant);
		});
		
		//URL
		const urlExp = [
			card._description.value,
			amount,
			participants.indexOf(paidBy),
			Array.from(usedBy, p => participants.indexOf(p))
		];
		urlGen.e.push(urlExp);
	});
	
	//URL
	const encoded = encodeURIComponent(JSON.stringify(urlGen));
	history.replaceState(null, "", "?data=" + encoded);
}