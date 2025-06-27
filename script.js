const API_ENDPOINT = 'https://5ak2nip9i9.execute-api.us-east-1.amazonaws.com/prod/websitecounterlambdaendpoint'

document.addEventListener("DOMContentLoaded", (event) => {
    update_counter();
});

async function update_counter(){
    try {
        const response = await fetch(API_ENDPOINT, {method: "POST"});
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