(function($) {
    $.get('wallet/portfolio_value', (data) => {
        getChart(data);
    })

})(window.jQuery);

function getChart(portfolioData) {
    const dates = portfolioData.map((transactionObj) => {
        return Object.entries(transactionObj)[0][1];
    })

    const values = portfolioData.map((transactionObj) => {
        return Object.entries(transactionObj)[1][1];
    })

    const data = {
        labels: dates,
        datasets: [{
            label: 'Transaction History',
            backgroundColor: 'rgb(255, 99, 132)',
            borderColor: 'rgb(255, 99, 132)',
            data: values,
        }]
    };

    const config = {
        type: 'line',
        data: data,
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    }

    const myChart = new Chart(
        document.getElementById('myChart'),
        config
    )
}