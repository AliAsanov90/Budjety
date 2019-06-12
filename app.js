
// Budget Controller
const budgetController = (function() {

  const Expense = function(id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
    this.percentage = -1;
  }

  Expense.prototype.calcPercentage = function(totalIncome) {
    if (totalIncome > 0) {
      this.percentage = Math.round((this.value / totalIncome) * 100);
    } else {
      this.percentage = -1;
    }
  };

  Expense.prototype.getPercentage = function() {
    return this.percentage;
  };

  const Income = function(id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
  }

  const calculateTotal = function(type) {
    let sum = 0;
    data.allItems[type].forEach((cur) => sum += cur.value);
    data.totals[type] = sum;
  };

  const data = {
    allItems: {
      exp: [],
      inc: []
    },
    totals: {
      exp: 0,
      inc: 0
    },
    budget: 0,
    percentage: -1
  };

  return {
    addItem: function(type, des, val) {
      let newItem, ID;

      // Create new ID
      if (data.allItems[type].length > 0) {
        ID = data.allItems[type][data.allItems[type].length -1].id + 1;
      } else {
        ID = 0;
      }

      // Create new item based on 'inc' or 'exp' type
      if (type === 'exp') {
        newItem = new Expense(ID, des, val);
      }
      else if (type === 'inc') {
        newItem = new Income(ID, des, val);
      }

      // Push new item into our data structure
      data.allItems[type].push(newItem);

      // Return the new element
      return newItem;
    },

    deleteItem: function(type, id) {
      let ids, index;

      ids = data.allItems[type].map(function(current) {
        return current.id;
      });

      index = ids.indexOf(id);

      if (index !== -1) {
        data.allItems[type].splice(index, 1);
      }
    },

    calculateBudget: function() {

      //  Calculate total income and expenses
      calculateTotal('exp');
      calculateTotal('inc');

      //  Calculate the budget: income - expenses
      data.budget = data.totals.inc - data.totals.exp;

      //  Calculate the percentage of income that we spent
      if (data.totals.inc > 0) {
        data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
      }
      else data.percentage = -1;
    },

    calculatePercentages: function() {
      data.allItems.exp.forEach(expense => expense.calcPercentage(data.totals.inc));
    },

    getPercentages: function() {
      let allPerc = data.allItems.exp.map(expense => expense.getPercentage());
      return allPerc;
    },

    getBudget: function() {
      return {
        budget: data.budget,
        totalInc: data.totals.inc,
        totalExp: data.totals.exp,
        percentage: data.percentage
      };
    },

    testing: function() {
      console.log(data);
    }
  };

})();


// UI Controller
const UIController = (function() {

  const DOMstrings = {
    inputType: '.add__type',
    inputDescription: '.add__description',
    inputValue: '.add__value',
    inputBtn: '.add__btn',
    incomeContainer: '.income__list',
    expensesContainer: '.expenses__list',
    budgetLabel: '.budget__value',
    incomeLabel: '.budget__income--value',
    expensesLabel: '.budget__expenses--value',
    percentageLabel: '.budget__expenses--percentage',
    container: '.container',
    expensesPercLabel: '.item__percentage',
    dateLabel: '.budget__title--month'
  };

  const formatNumber = function(num, type) {
    let numSplit, int, dec, sign;

    num = Math.abs(num);
    num = num.toFixed(2);

    numSplit = num.split('.');
    int = numSplit[0];

    if (int.length > 3) {
      int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3);
    }
    dec = numSplit[1];

    if (type === 'exp') sign = '-';
    else if (type === 'inc') sign = '+';
    else sign = '';

    return sign + ' ' + int + '.' + dec;
  };

  return {
    getInput: function() {
      return {
        type: document.querySelector(DOMstrings.inputType).value,
        description: document.querySelector(DOMstrings.inputDescription).value,
        value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
      };
    },

    addListItem: function(obj, type) {
      let html, newHtml, element;

      //  Create HTML string with placeholder text
      if (type === 'inc') {
        element = DOMstrings.incomeContainer;

        html = '<div class="item clearfix" id="inc-%id%"> <div class="item__description">%description%</div> <div class="right clearfix"> <div class="item__value">%value%</div> <div class="item__delete"> <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button> </div> </div> </div>';
      }
      else if (type === 'exp') {
        element = DOMstrings.expensesContainer;

        html = '<div class="item clearfix" id="exp-%id%"> <div class="item__description">%description%</div> <div class="right clearfix"> <div class="item__value">%value%</div> <div class="item__percentage">21%</div> <div class="item__delete"> <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button> </div> </div> </div>';
      }

      //  Replace the placeholder with some actual data
      newHtml = html.replace('%id%', obj.id);
      newHtml = newHtml.replace('%description%', obj.description);
      newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));

      // Insert the HTML into the DOM
      document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);

    },

    deleteListItem: function(selectorID) {

      let el = document.getElementById(selectorID);
      el.parentNode.removeChild(el);
    },

    clearFields: function() {
      let fields, fieldsArr;

      fields = document.querySelectorAll(DOMstrings.inputDescription + ', ' + DOMstrings.inputValue);
      fieldsArr = Array.prototype.slice.call(fields);

      fieldsArr.forEach((field, i, arr) => field.value = '');
      fieldsArr[0].focus();
    },

    displayBudget: function(obj) {
      let type;
      if (obj.budget > 0) type = 'inc';
      else if (obj.budget < 0) type = 'exp';

      document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget, type);
      document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
      document.querySelector(DOMstrings.expensesLabel).textContent = formatNumber(obj.totalExp, 'exp');

      if (obj.percentage > 0) {
        document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%';
      } else {
        document.querySelector(DOMstrings.percentageLabel).textContent = '---';
      }
    },

    displayPercentages: function(percentages) {
      let fields = document.querySelectorAll(DOMstrings.expensesPercLabel);
      fields.forEach((item, i) => {
        if (percentages[i] > 0)
          item.textContent = percentages[i] + '%';
        else item.textContent = '---';
      });
    },

    displayMonth: function() {
      let now, year, month, monthsArr;

      monthsArr = ['January','February','March','April','May','June','July','August','September','October','November','December'];

      now = new Date();
      year = now.getFullYear();
      month = now.getMonth();

      document.querySelector(DOMstrings.dateLabel).textContent = monthsArr[month] + ' ' + year;

    },

    changedType: function() {
      let fields = document.querySelectorAll(
        DOMstrings.inputType + ', ' +
        DOMstrings.inputDescription + ', ' +
        DOMstrings.inputValue
      );

      fields.forEach(field => field.classList.toggle('red-focus'));
      document.querySelector(DOMstrings.inputBtn).classList.toggle('red');
    },

    getDOMstrings: function() {
      return DOMstrings;
    }
  };

})();


// Global App Controller
const controller = (function(budgetCtrl, UICtrl) {

  const setupEventListeners = function() {
    const DOM = UICtrl.getDOMstrings();

    document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);
    document.addEventListener('keypress', function(event) {
      if (event.keyCode === 13 || event.which === 13) {
        ctrlAddItem();
      }
    });

    document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);

    document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changedType);
  };

  const updateBudget = function() {

    //  1. Calculate the budget
    budgetCtrl.calculateBudget();

    //  2. Return the budget
    let budget = budgetCtrl.getBudget();

    //  3. Display the budget on the UI
    UICtrl.displayBudget(budget);

  };

  const updatePercentages = function() {

    //  1. Calculate percentages
    budgetCtrl.calculatePercentages();

    //  2. Read percentages from the budget controller
    let percentages = budgetCtrl.getPercentages();

    //  3. Update the UI with the new percentages
    UICtrl.displayPercentages(percentages);
  };

  const ctrlAddItem = function() {
    let input, newItem;

    //  1. Get the field input data
    input = UICtrl.getInput();

    if (input.description !== '' && !isNaN(input.value) && input.value > 0) {
      //  2. Add the item to the budgetController
      newItem = budgetCtrl.addItem(input.type, input.description, input.value);

      //  3. Add the item to the UI
      UICtrl.addListItem(newItem, input.type);

      //  4. Clear the fields
      UICtrl.clearFields();

      //  5. Calculate and update budget
      updateBudget();

      //  6. Calculate and update the percentages
      updatePercentages();

    }
  };

  const ctrlDeleteItem = function(event) {
    let itemID, splitID, type, ID;

    itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

    if (itemID) {
      splitID = itemID.split('-');
      type = splitID[0];
      ID = parseInt(splitID[1]);

      // 1. Delete the item from the data structure
      budgetCtrl.deleteItem(type, ID);

      // 2. Delete the item from the UI
      UICtrl.deleteListItem(itemID);

      // 3. Update and show the new budget
      updateBudget();

      // 4. Calculate and update the percentages
      updatePercentages();

    }

  };

  return {
    init: function() {
      console.log('The app has started');

      // Clear labels displayed in budget section at the top
      UICtrl.displayBudget({
        budget: 0,
        totalInc: 0,
        totalExp: 0,
        percentage: -1
      });

      UICtrl.displayMonth();

      setupEventListeners();
    }
  };

})(budgetController, UIController);


controller.init();
