$(document).ready(function() {
  $('#zossTable').DataTable({
    ajax: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRdsw-kqJf1uuvB1Ame5UwemOGitSCmhHGI9r4EpxZOgqXHHEGTbMXFxWT5XE8xzk3MppbC9oa1M0YX/pub?output=csv',
    columns: [
      { title: "Panjang ZoSS" },
      { title: "Lebar Jalan" },
      { title: "Status Jalan" },
      { title: "Kondisi Marka ZoSS" },
      { title: "Kondisi Rambu ZoSS" },
      { title: "Kondisi Zebra Cross" },
      { title: "Kondisi Pita Penggaduh" },
      { title: "Volume" }
    ],
    paging: true
  });
});
