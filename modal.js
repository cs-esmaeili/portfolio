let isModalOpen = false;
const modal = document.querySelector(".modal");
const modalbgOverlay = document.querySelector(".modal-bg-overlay");
const modalTitle = document.querySelector(".modal-title");
const modalProjectDescription = document.querySelector(".modal-project-description");
const modalVisitProjectButton = document.querySelector(".modal-project-visit-button");

const modalContent = {
    tablo1: {
        title: "🍜Recipe Finder👩🏻‍🍳",
        content:
            "Let's get cooking! This project uses TheMealDB API for some recipes and populates my React card components. This shows my skills in working with consistent design systems using components. There is also pagination to switch pages.",
        link: "https://example.com/",
    },
    tablo2: {
        title: "📋ToDo List✏️",
        content:
            "Keeping up with everything is really exhausting so I wanted to create my own ToDo list app. But I wanted my ToDo list to look like an actual ToDo list so I used Tailwind CSS for consistency and also did state management with React hooks like useState.",
        link: "https://example.com/",
    },
    tablo3: {
        title: "🌞Weather App😎",
        content:
            "Rise and shine as they say (but sometimes it's not all that shiny outside). Using a location-based API the user can automatically detect their location and my application will show them the weather near them. I also put some of my design skills to use using Figma.",
        link: "https://example.com/",
    },
};


export const showModal = (id) => {
    console.log(id);
    
    const content = modalContent[id];
    if (content) {
        modalTitle.textContent = content.title;
        modalProjectDescription.textContent = content.content;

        if (content.link) {
            modalVisitProjectButton.href = content.link;
            modalVisitProjectButton.classList.remove("hidden");
        } else {
            modalVisitProjectButton.classList.add("hidden");
        }
        modal.classList.remove("hidden");
        modalbgOverlay.classList.remove("hidden");
        isModalOpen = true;
    }
}

export const hideModal = () => {
    isModalOpen = false;
    modal.classList.add("hidden");
    modalbgOverlay.classList.add("hidden");
}
