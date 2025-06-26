const API_ENDPOINT = 'https://l3emasvz8k.execute-api.us-east-1.amazonaws.com/prod/websitecounter'

document.addEventListener("DOMContentLoaded", (event) => {
    update_counter();
});

async function update_counter(){
    try {
        const response = await fetch(API_ENDPOINT);
        if(!response.ok){
            document.getElementById("visitor-count").textContent = '-';
            throw new Error(`Response status: ${response.status}`)
        }

        const json = await response.json();
        num_views = json['num_views']

        document.getElementById("visitor-count").textContent = num_views || '0';
    } catch (error) {
        document.getElementById("visitor-count").textContent = '-';
        console.error('Failed to fetch visitor count: ', error);
    }
}