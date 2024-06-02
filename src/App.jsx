import React, { useMemo, useRef, useState } from "react";
import { Chart as ChartJS, defaults } from "chart.js/auto";
import { Bar, Doughnut, Line } from "react-chartjs-2";
import { useTable, usePagination } from "react-table";
import zoomPlugin from 'chartjs-plugin-zoom';

import "./App.css";

import eveData from "./data/eve.json";

ChartJS.register(zoomPlugin);

defaults.maintainAspectRatio = false;
defaults.responsive = true;

defaults.plugins.title.display = true;
defaults.plugins.title.align = "start";
defaults.plugins.title.font.size = 30;
defaults.plugins.title.color = "white";

const App = () => {
  const lineChartRef = useRef(null);
  const barChartRef = useRef(null);
  const doughnutChartRef = useRef(null);

  function onlyUnique(value, index, array) {
    return array.indexOf(value) === index;
  }

  const uniqueEventTypes = eveData.map((data) => data.event_type).filter(onlyUnique);

  const eventCounts = uniqueEventTypes.map(eventType => {
    return {
      eventType: eventType,
      count: eveData.filter(data => data.event_type === eventType).length
    };
  });

  const protocalls = eveData.map((data) => data.proto).filter(onlyUnique);

  const protocallEventCounts = protocalls.map(protocall =>
    eveData.filter(data => data.proto === protocall).length
  );

  console.log(protocallEventCounts);

  const zoomOptions = {
    pan: {
      enabled: true,
      mode: 'xy',
      threshold: 10,
    },
    zoom: {
      wheel: {
        enabled: true,
      },
      pinch: {
        enabled: true
      },
      mode: 'xy',
    }
  };

  const gridColor = '#78716C';
  const textColor = '#9CA3AF';

  const handleResetZoom = () => {
    if (lineChartRef.current) {
      lineChartRef.current.resetZoom();
    }
    if (barChartRef.current) {
      barChartRef.current.resetZoom();
    }
    if (doughnutChartRef.current) {
      doughnutChartRef.current.resetZoom();
    }
  };

  // Define columns for the table
  const columns = useMemo(
    () => [
      {
        Header: "Timestamp",
        accessor: "timestamp"
      },
      {
        Header: "Flow ID",
        accessor: "flow_id"
      },
      {
        Header: "Interface",
        accessor: "in_iface"
      },
      {
        Header: "Event Type",
        accessor: "event_type"
      },
      {
        Header: "Source IP",
        accessor: "src_ip"
      },
      {
        Header: "Source Port",
        accessor: "src_port"
      },
      {
        Header: "Destination IP",
        accessor: "dest_ip"
      },
      {
        Header: "Destination Port",
        accessor: "dest_port"
      },
      {
        Header: "Protocol",
        accessor: "proto"
      },
      {
        Header: "Alert Action",
        accessor: "alert.action"
      },
      {
        Header: "Alert GID",
        accessor: "alert.gid"
      },
      {
        Header: "Alert Signature ID",
        accessor: "alert.signature_id"
      },
      {
        Header: "Alert Rev",
        accessor: "alert.rev"
      },
      {
        Header: "Alert Signature",
        accessor: "alert.signature"
      },
      {
        Header: "Alert Category",
        accessor: "alert.category"
      },
      {
        Header: "Alert Severity",
        accessor: "alert.severity"
      }
    ],
    []
  );

  // Use react-table to create the table instance
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    page,
    nextPage,
    previousPage,
    canNextPage,
    canPreviousPage,
    pageOptions,
    prepareRow,
    state: { pageIndex },
  } = useTable(
    { columns, data: eveData, initialState: { pageIndex: 0 }, pageSize: 5 },
    usePagination
  );

  return (
    <div className="App">
      <div className="dataCard revenueCard">
        <button onClick={handleResetZoom} className="resetZoomButton">Reset Zoom</button>
        <Line
          ref={lineChartRef}
          data={{
            labels: eveData.map((data) => data.timestamp),
            datasets: [
              {
                label: "severity",
                data: eveData.filter((data) => data.event_type === "alert").map((data) => data.alert.severity),
                backgroundColor: "#F97316",
                borderColor: "#F97316",
                fill: false
              },
            ],
          }}
          options={{
            elements: {
              line: {
                tension: 0.5,
              },
            },
            scales: {
              x: {
                grid: {
                  color: gridColor,
                },
                ticks: {
                  color: textColor,
                },
              },
              y: {
                grid: {
                  color: gridColor,
                },
                ticks: {
                  color: textColor,
                },
              },
            },
            plugins: {
              title: {
                text: "Alert Severity",
              },
              zoom: zoomOptions,
            },
          }}
        />

      </div>

      <div className="dataCard customerCard">
        <Bar
          ref={barChartRef}
          data={{
            labels: protocalls,
            datasets: [
              {
                label: "count",
                data: protocallEventCounts,
                backgroundColor: [
                  "rgb(43, 63, 229)",
                  "rgb(250, 192, 19)",
                ],
                borderRadius: 5,
              },
            ],
          }}
          options={{
            scales: {
              x: {
                grid: {
                  color: gridColor,
                },
                ticks: {
                  color: textColor,
                },
              },
              y: {
                grid: {
                  color: gridColor,
                },
                ticks: {
                  color: textColor,
                },
              },
            },
            plugins: {
              title: {
                text: "Protocall Distribution",
              },
              // zoom: zoomOptions,
            },
          }}
        />
      </div>

      <div className="dataCard categoryCard">
        <Doughnut
          ref={doughnutChartRef}
          data={{
            labels: uniqueEventTypes,
            datasets: [
              {
                label: "Count",
                data: eventCounts.map(data => data.count),
                backgroundColor: [
                  "rgb(43, 63, 229)",
                  "rgb(250, 192, 19)",
                  "rgb(253, 135, 135)",
                  "rgb(255, 0, 0)",
                  "rgb(60, 179, 113)"
                ],
                borderColor: [
                  "rgba(43, 63, 229)",
                  "rgba(250, 192, 19)",
                  "rgba(253, 135, 135)",
                  "rgba(255, 0, 0)",
                  "rgba(60, 179, 113)"
                ],
              },
            ],
          }}
          options={{
            plugins: {
              title: {
                text: "Event Type Distribution",
              },
              // zoom: zoomOptions,
            },
          }}
        />
      </div>


      <div className="tableCard">
        <div className="heading-box">
          <p className="heading">Network Data</p>
        </div>
        <table className="dataTable" {...getTableProps()}>
          <thead>
            {headerGroups.map(headerGroup => (
              <tr {...headerGroup.getHeaderGroupProps()}>
                {headerGroup.headers.map(column => (
                  <th {...column.getHeaderProps()}>{column.render('Header')}</th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody {...getTableBodyProps()}>
            {page.map(row => {
              prepareRow(row);
              return (
                <tr {...row.getRowProps()}>
                  {row.cells.map(cell => (
                    <td {...cell.getCellProps()}>{cell.render('Cell')}</td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>

        <div className="pagination">
          <button onClick={() => previousPage()} disabled={!canPreviousPage}>
            Previous
          </button>
          <span>
            Page{' '}
            <strong>
              {pageIndex + 1} of {pageOptions.length}
            </strong>{' '}
          </span>
          <button onClick={() => nextPage()} disabled={!canNextPage}>
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default App;
