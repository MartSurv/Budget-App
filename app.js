const budgetController = (function () {

    // Expenses class
    class Expense {
        constructor(id, description, value) {
            this.id = id;
            this.description = description;
            this.value = value;
            this.percentage = -1;
        }

        calcPercentage(totalIncome) {
            if (totalIncome > 0) {
                this.percentage = Math.round((this.value / totalIncome) * 100);
            } else {
                this.percentage = -1;
            }
        }

        getPercentage() {
            return this.percentage;
        }
    }

    // Income class
    class Income {
        constructor(id, description, value) {
            this.id = id;
            this.description = description;
            this.value = value;
        }
    }

    // Data object
    const data = {
        allItems: {
            inc: [],
            exp: []
        },
        totals: {
            inc: 0,
            exp: 0
        },
        budget: 0,
        percentage: 0
    }

    /**
     * Calculate total income or total expenses and update data object values.
     * @param {String} type inc or exp
     */
    function calculateTotal(type) {
        var sum = 0;
        data.allItems[type].forEach(function (item) {
            sum += item.value;
        });
        data.totals[type] = sum;
    }

    return {

        /**
         * Creates item ID based on the last item index ->
         * Creates new Expense or new Income based on the type ->
         * Pushes new item to the inc or exp array.
         * @param {String} type inc or exp
         * @param {String} des getinput() description
         * @param {String} val getinput() value
         */
        addItem: function (type, des, val) {
            var newItem, ID;

            // ID based on last ID
            if (data.allItems[type].length > 0) {
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            } else {
                ID = 0;
            }

            // Create new item based on 'inc' or 'exp' type
            if (type === 'exp') {
                newItem = new Expense(ID, des, val);
            } else if (type === 'inc') {
                newItem = new Income(ID, des, val);
            }

            data.allItems[type].push(newItem);
            return newItem;
        },

        /**
         * Creates an array with all inc or exp items indexes.
         * Removes item by its id index.
         * @param {String} type 
         * @param {Number} objID 
         */
        removeItem: function (type, objID) {
            var ids, index;

            ids = data.allItems[type].map(function (item) {
                return item.id;
            });

            index = ids.indexOf(objID);

            if (index !== -1) {
                data.allItems[type].splice(index, 1);
            }
        },

        /**
         * Calculate the budget and the percentage for income and expenses.
         */
        calculateBudget: function () {
            calculateTotal('exp');
            calculateTotal('inc');
            data.budget = data.totals.inc - data.totals.exp;
            if (data.totals.inc > 0) {
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            } else {
                data.percentage = -1;
            }
        },

        calculatePercentages: function () {
            data.allItems.exp.forEach(function (expense) {
                expense.calcPercentage(data.totals.inc);
            });
        },

        getPercentages: function () {
            var percentages;
            percentages = data.allItems.exp.map(function (expense) {
                return expense.getPercentage();
            });
            return percentages;
        },

        /**
         * Public data object access.
         */
        getBudget: function () {
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            }
        },
        testing: function () {
            return data
        }
    }

})();

const UIController = (function () {

    // DOM strings stored in a constant
    const DOMstrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputButton: '.add__btn',
        expensesList: '.expenses__list',
        incomeList: '.income__list',
        budgetLabel: '.budget__value',
        budgetIncomeLabel: '.budget__income--value',
        budgetExpensesLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        expensesPercentageLabel: '.item__percentage',
        dateLabel: '.budget__title--month'
    }

    function formatNumber(num, type) {
        var numSplit, int, dec;

        num = Math.abs(num);
        num = num.toFixed(2);

        numSplit = num.split('.');

        int = numSplit[0];
        if (int.length > 3 && int.length < 7) {
            int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, int.length); // input 1000/11000, output 1,000/11,000
        } else if (int.length === 7) {
            int = int.substr(0, int.length - 6) + ',' + int.substr(int.length - 6, int.length - 4) + ',' + int.substr(int.length - 3, int.length);
        }
        dec = numSplit[1];

        return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec;
    }

    /**
     * Custom function to loop through a Node List.
     * @param {array} list 
     * @param {function} callback 
     */
    function nodeListForEach(list, callback) {
        for (var i = 0; i < list.length; i++) {
            callback(list[i], i);
        }
    }

    return {

        /**
         * Get input values
         */
        getinput: function () {
            return {
                type: document.querySelector(DOMstrings.inputType).value,
                description: document.querySelector(DOMstrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMstrings.inputValue).value),
            }
        },

        checkInput: function () {
            var input = this.getinput();
            if (input.value > 9999999) {
                document.getElementById('warning').style.animation = 'warningOn .3s';
                document.getElementById('warning').style.visibility = 'visible';
            } else {
                document.getElementById('warning').style.visibility = 'hidden';
                document.getElementById('warning').style.animation = '';
            }
        },

        /**
         * Add the html code of items to the HTML document whether it is an income or an expense
         * @param {object} obj getBudget() object
         * @param {String} type getinput() type
         */
        addListItem: function (obj, type) {

            if (type === 'inc') {
                var element, html;
                html = `<div class="item clearfix" id="inc-${obj.id}"><div class="item__description">${obj.description}</div><div class="right clearfix"><div class="item__value">${formatNumber(obj.value, type)}</div><div class="item__delete"><button class="item__delete--btn"><i class="far fa-times-circle"></i></button></div></div></div>`;
                element = DOMstrings.incomeList;
            } else if (type === 'exp') {
                html = `<div class="item clearfix" id="exp-${obj.id}"><div class="item__description">${obj.description}</div><div class="right clearfix"><div class="item__value">${formatNumber(obj.value, type)}</div><div class="item__percentage">${obj.percentage}</div><div class="item__delete"><button class="item__delete--btn"><i class="far fa-times-circle"></i></button></div></div></div>`;
                element = DOMstrings.expensesList;
            }

            document.querySelector(element).insertAdjacentHTML('beforeend', html);
        },

        removeListItem: function (id) {
            const listItem = document.getElementById(id);
            listItem.style.animation = 'fadeOut 1s cubic-bezier(1,-0.4,.01,.99)';
            setTimeout(() => {
                listItem.remove();
            }, 800);
        },

        /**
         * Clear input values after adding an income or an expense
         */
        clearInput: function () {
            const inputs = document.querySelectorAll(DOMstrings.inputDescription + ', ' + DOMstrings.inputValue);
            const inputsArray = [...inputs];
            inputsArray.forEach(function (input) {
                input.value = '';
            });
            inputsArray[0].focus();
        },

        inputColor: function () {
            const inputs = document.querySelectorAll(
                DOMstrings.inputType + ',' +
                DOMstrings.inputDescription + ',' +
                DOMstrings.inputValue
            );
            nodeListForEach(inputs, function (input) {
                input.classList.toggle('red-focus');
            });

            document.querySelector(DOMstrings.inputButton).classList.toggle('red');
        },

        /**
         * Manipulate DOM with returned getBudget() data
         * @param {object} obj getBudget() data
         */
        displayBudget: function (obj) {

            obj.budget > 0 ? type = 'inc' : type = 'exp';

            document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget, type);
            document.querySelector(DOMstrings.budgetIncomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
            document.querySelector(DOMstrings.budgetExpensesLabel).textContent = formatNumber(obj.totalExp, 'exp');

            if (obj.percentage > 0) {
                document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + ' %';
            } else if (obj.percentage > 1000) {
                document.querySelector(DOMstrings.percentageLabel).textContent = '---';
            }
        },

        displayPercentages: function (percentages) {
            var expensesNodeList;
            expensesNodeList = document.querySelectorAll(DOMstrings.expensesPercentageLabel);

            nodeListForEach(expensesNodeList, function (item, index) {
                if (percentages[index] > 0) {
                    item.textContent = percentages[index] + ' %';
                } else {
                    item.textContent = '---';
                }
            });
        },

        displayMonth: function () {
            const monthNames = ["January", "February", "March", "April", "May", "June",
                "July", "August", "September", "October", "November", "December"
            ];
            const now = new Date();
            const month = monthNames[now.getMonth()];
            document.querySelector(DOMstrings.dateLabel).textContent = month;
        },

        /**
         * Return defined DOMstrings
         */
        getDOMstrings: function () {
            return DOMstrings;
        }
    }

})();

const appController = (function (budgetCtrl, UICtrl) {

    /**
     * Hello.
     * This is a docstring.
     */
    function startEventListeners() {

        UICtrl.displayMonth();
        const DOM = UICtrl.getDOMstrings();

        document.querySelector(DOM.inputButton).addEventListener('click', ctrlAddItem);

        document.addEventListener('keypress', function (e) {
            if (e.keyCode === 13 || e.which === 13) {
                ctrlAddItem();
            }
        });

        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);

        document.querySelector(DOM.inputType).addEventListener('change', UICtrl.inputColor);
    }

    /**
     * Calculate budget data object values ->
     * Store budget data in a const ->
     * Display budget data in HTML.
     */
    function updateBudget() {

        budgetCtrl.calculateBudget();
        const budgetData = budgetCtrl.getBudget();
        UICtrl.displayBudget(budgetData);
    }

    function updatePercentages() {
        budgetCtrl.calculatePercentages();
        const percentages = budgetCtrl.getPercentages();
        UICtrl.displayPercentages(percentages);
    }

    /**
     * Get input ->
     * Check if input is correct ->
     * Add item to data object ->
     * Clear input fields ->
     * Update budget information
     */
    function ctrlAddItem() {
        const input = UICtrl.getinput();

        if (input.description != '' && !isNaN(input.value) && input.value > 0) {
            const newItem = budgetCtrl.addItem(input.type, input.description, input.value);
            UICtrl.addListItem(newItem, input.type);
            UICtrl.clearInput();
            updateBudget();
            updatePercentages();
        }
    }

    function ctrlDeleteItem(e) {
        var itemToDeleteID, splitID, type, ID;

        itemToDeleteID = e.target.parentNode.parentNode.parentNode.parentNode.id;

        if (itemToDeleteID) {
            splitID = itemToDeleteID.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]);
            budgetCtrl.removeItem(type, ID);
            UICtrl.removeListItem(itemToDeleteID);
            updateBudget();
        }

    }

    return {
        init: startEventListeners(),
    }

})(budgetController, UIController);

appController.init;