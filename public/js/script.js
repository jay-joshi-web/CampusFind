console.log("JavaScript is working!");

const itemForm = document.getElementById("itemForm");
const itemList = document.getElementById("itemList");
const filterType = document.getElementById("filterType");
const formMessage = document.getElementById("formMessage");

let allItems = [];

// Check if HTML elements exist
if (!itemForm || !itemList || !filterType || !formMessage) {
    console.error("Some HTML elements are missing. Check your element IDs.");
}

// Get reports from the server
async function loadItems() {
    try {
        console.log("Loading reports...");

        const response = await fetch("/api/items");

        if (!response.ok) {
            throw new Error("Server error: " + response.status);
        }

        allItems = await response.json();

        console.log("Reports loaded:", allItems);

        displayItems();

    } catch (error) {
        console.error("Error loading reports:", error);
        itemList.innerHTML = "<p>Could not load reports. Check server/database.</p>";
    }
}

// Display reports
function displayItems() {
    const selectedType = filterType.value;

    const filteredItems = selectedType === "All"
        ? allItems
        : allItems.filter(item => item.item_type === selectedType);

    itemList.innerHTML = "";

    if (filteredItems.length === 0) {
        itemList.innerHTML = "<p>No reports found.</p>";
        return;
    }

    filteredItems.forEach(item => {
        const card = document.createElement("div");
        card.className = "item-card";

        const title = document.createElement("h3");
        title.textContent = item.item_name;

        const badge = document.createElement("span");
        badge.className = item.item_type === "Lost" ? "badge lost" : "badge";
        badge.textContent = item.item_type;

        const category = document.createElement("p");
        category.textContent = "Category: " + item.category;

        const location = document.createElement("p");
        location.textContent = "Location: " + item.location;

        const description = document.createElement("p");
        description.textContent = item.description || "No description provided.";

        const contact = document.createElement("p");
        contact.textContent = "Contact: " + item.contact;

        const deleteButton = document.createElement("button");
        deleteButton.className = "delete-button";
        deleteButton.textContent = "Delete report";

        deleteButton.addEventListener("click", function () {
            deleteItem(item.id);
        });

        card.append(
            badge,
            title,
            category,
            location,
            description,
            contact,
            deleteButton
        );

        itemList.appendChild(card);
    });
}

// Submit a new report
itemForm.addEventListener("submit", async function (event) {

    event.preventDefault();

    console.log("SUBMIT BUTTON CLICKED!");

    const item = {
        item_name: document.getElementById("item_name").value.trim(),
        item_type: document.getElementById("item_type").value,
        category: document.getElementById("category").value,
        location: document.getElementById("location").value.trim(),
        description: document.getElementById("description").value.trim(),
        contact: document.getElementById("contact").value.trim()
    };

    console.log("Sending item:", item);

    // Validate form
    if (
        !item.item_name ||
        !item.item_type ||
        !item.category ||
        !item.location ||
        !item.contact
    ) {
        formMessage.textContent = "Please fill in all required fields.";
        return;
    }

    formMessage.textContent = "Submitting report...";

    try {
        const response = await fetch("/api/items", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(item)
        });

        const data = await response.json();

        console.log("Server response:", data);

        if (!response.ok) {
            throw new Error(data.message || "Failed to submit report.");
        }

        formMessage.textContent = "Report submitted successfully!";

        itemForm.reset();

        filterType.value = "All";

        await loadItems();

    } catch (error) {
        console.error("Submission error:", error);

        formMessage.textContent =
            error.message || "Could not submit report. Check server/database.";
    }
});

// Delete a report
async function deleteItem(id) {

    if (!confirm("Are you sure you want to delete this report?")) {
        return;
    }

    try {
        const response = await fetch("/api/items/" + id, {
            method: "DELETE"
        });

        const data = await response.json();

        console.log("Delete response:", data);

        if (!response.ok) {
            throw new Error(data.message || "Could not delete report.");
        }

        loadItems();

    } catch (error) {
        console.error("Delete error:", error);
        alert(error.message);
    }
}

// Filter Lost and Found reports
filterType.addEventListener("change", displayItems);

// Load reports when page opens
loadItems();