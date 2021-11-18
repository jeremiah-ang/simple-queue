/**
 * You probably need to know about
 * Asynchronous JavaScript & Promise:
 *
 * Read all the guides in here:
 *  https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Asynchronous
 */

function getCustomersInQueue() {
  /**
   * GET /api/customers
   * */
  return fetch(`/api/customers`)
    .then(function (response) {
      // Convert response body to JSON
      return response.json();
    })
    .then(function (json) {
      if (json.error) {
        throw new Error(json.error);
      }
      return json.customers;
    });
}

function addCustomerToQueue(customerName) {
  /**
   * POST /api/customers
   * Content-Type: application/json
   *
   * {
   *    "name": "Tom"
   * }
   */
  return fetch(`/api/customers`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: customerName,
    }),
  })
    .then(function (response) {
      // Convert response body to json
      return response.json();
    })
    .then(function (json) {
      if (json.error) {
        throw new Error(json.error);
      }
      return json.id;
    });
}

function getCurrentCustomer() {
  /**
   * GET /api/customers/current
   */
  return fetch(`/api/customers/current`)
    .then(function (response) {
      if (response.status === 400) {
        // If there's no customer being served
        return { customer: {} };
      }
      // Convert response body to json
      return response.json();
    })
    .then(function (json) {
      if (json.error) {
        throw new Error(json.error);
      }
      return json.customer;
    });
}

function deleteNextCustomer() {
  /**
   * DELETE /api/customers/
   */
  return fetch(`/api/customers/`, {
    method: 'DELETE',
  })
    .then(function (response) {
      // Convert response body to json
      return response.json();
    })
    .then(function (json) {
      if (json.error) {
        throw new Error(json.error);
      }
      return json.customer;
    });
}

window.addEventListener('DOMContentLoaded', function () {
  // Get reference to relevant elements
  const customerNameInput = document.getElementById('name');
  const joinQueueButton = document.getElementById('join-queue');
  const refreshButton = document.getElementById('refresh');
  const serveNextButton = document.getElementById('next');
  const customerList = document.getElementById('customers');
  const customerIdField = document.getElementById('customer-id');
  const customerNameField = document.getElementById('customer-name');
  const overlayLoading = document.getElementById('loading');

  // To update "Now Serving"
  function setCurrentCustomer(customer) {
    if (!customer.id) return;
    customerIdField.textContent = `#${customer.id}`;
    customerNameField.textContent = customer.name;
  }

  // To update "Customers in Queue"
  function refreshCustomerList() {
    refreshButton.disabled = true;
    return getCustomersInQueue()
      .then(function (customers) {
        customerList.innerHTML = '';
        customers.forEach(function (customer) {
          const customerLi = `<li>#${customer.id} - ${customer.name}</li>`;
          customerList.innerHTML += customerLi;
        });
      })
      .catch(function (error) {
        alert(error.message);
      })
      .finally(function () {
        refreshButton.disabled = false;
      });
  }

  function serveNextCustomer() {
    serveNextButton.disabled = true;
    return deleteNextCustomer()
      .then(setCurrentCustomer)
      .catch(function (error) {
        alert(error.message);
      })
      .then(refreshCustomerList)
      .finally(function () {
        serveNextButton.disabled = false;
      });
  }

  // Add new customer to queue upon clicking "Join Queue!" button
  joinQueueButton.onclick = function () {
    // To ensure customer name in the input is valid
    if (!customerNameInput.reportValidity()) {
      return;
    }
    const customerName = customerNameInput.value;

    // To show that we're waiting for response from server
    joinQueueButton.disabled = true;
    addCustomerToQueue(customerName)
      .catch(function (error) {
        alert(error.message);
      })
      .finally(function () {
        joinQueueButton.disabled = false;
        refreshCustomerList();
      });
  };

  // Update "Customers in Queue" upon clicking "refresh" button
  /**
   * Note: I'm assigning the function
   *      "refreshCustomerList" to the onclick property
   *      without calling the function.
   */
  refreshButton.onclick = refreshCustomerList;

  // Serve next customer on click of button
  serveNextButton.onclick = serveNextCustomer;

  // Refresh "Now Serving" on load
  const nowServingPromise = getCurrentCustomer()
    .then(setCurrentCustomer)
    .catch(function (error) {
      alert(error.message);
    });

  // Refresh "Customer in Queue" on load
  const customerInQueuePromise = refreshCustomerList();
  Promise.all([nowServingPromise, customerInQueuePromise]).finally(function () {
    overlayLoading.hidden = true;
  });
});
