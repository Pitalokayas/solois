const CSV_URL="https://docs.google.com/spreadsheets/d/e/2PACX-1vRdsw-kqJf1uuvB1Ame5UwemOGitSCmhHGI9r4EpxZOgqXHHEGTbMXFxWT5XE8xzk3MppbC9oa1M0YX/pub?output=csv";

async function loadData(){
const res=await fetch(CSV_URL);
const text=await res.text();

return Papa.parse(text,{
header:true,
skipEmptyLines:true
}).data;
}
