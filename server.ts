import express from "express";
import http from "http";
import { WebSocketServer, WebSocket } from "ws";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { WSMessage, DeviceSession } from "./src/types";

const PORT = 3000;
const STATE_FILE_PATH = path.join(process.cwd(), "state_persistence.json");

// Default Fallback State matching standard values closely
function getInitialState() {
  return {
    sections: [
      {
        id: "operations",
        title: "Operations",
        color: "#06b6d4",
        items: [
          {
            id: "staff-contact",
            name: "Staff Contact",
            url: "https://docs.google.com/spreadsheets/d/1yBCD1EaDDyrh9AT0mcSgwgfghpB-8m8OHMoDmcf0Qf0/edit?gid=508321920#gid=508321920",
            icon: "Phone",
            color: "#07d54f"
          },
          {
            id: "staff-profile-checklist",
            name: "Staff Profile Checklist",
            url: "https://docs.google.com/spreadsheets/d/1zxPWWxcNb1mKDm1SnLqiLBuAU3Vg-eZvbvzCAeeRUmc/edit?gid=0#gid=0",
            icon: "IdCard",
            color: "#63d317"
          },
          {
            id: "personal-info",
            name: "Personal Information",
            url: "https://docs.google.com/spreadsheets/d/1Zz8FLfilGtQnBYga1fF7p7XSxRHxqdBsOVtgY-q0-QE/edit?gid=234623776#gid=234623776",
            icon: "User",
            color: "#0ad307"
          },
          {
            id: "annual-leave-full-time",
            name: "Annual Leave Full Time List",
            url: "https://docs.google.com/spreadsheets/d/1r67WEnQR4P6E6-P8yc1BduZZZV2iBcWDW_W34Cp3S9o/edit?gid=23875843#gid=23875843",
            icon: "CalendarCheck",
            color: "#07d556"
          },
          {
            id: "monthly-finger-scan",
            name: "Monthly Finger Scan",
            url: "https://docs.google.com/spreadsheets/d/199RolfC5YTP3o8rAFHBsnLwJT3q_y1lt15kfOFdJiMw/edit?gid=290872384#gid=290872384",
            icon: "Fingerprint",
            color: "#07d50a"
          },
          {
            id: "leaves-semi-full-time",
            name: "Leaves of Semi-Full Time",
            url: "https://docs.google.com/spreadsheets/d/1GClZrfksbZi408fJxqK0MWWQjN4uEq6JqOnIMhhfGqs/edit?gid=146108033#gid=146108033",
            icon: "Compass",
            color: "#07d530"
          },
          {
            id: "hr-master-list",
            name: "HR Master List",
            url: "https://docs.google.com/spreadsheets/d/1-H2paeueo4LcEql-GUAh1BsTTuIOGAwuzbU4kPLydCw/edit?gid=1412156498#gid=1412156498",
            icon: "Database",
            color: "#0ad307"
          },
          {
            id: "discount-report-list",
            name: "Discount Report List",
            url: "https://docs.google.com/spreadsheets/d/1IVz7ZZ6MgGqye5cNnptHoBcPQwcqZ1SWkWLZB-BIPr4/edit?gid=555464526#gid=555464526",
            icon: "Percent",
            color: "#07d50a"
          },
          {
            id: "monthly-emails-list",
            name: "Monthly Emails List",
            url: "https://docs.google.com/spreadsheets/d/1kucmDtdZ9BbXrefuUc4TYqxN8Khntchd/edit?gid=894204029#gid=894204029",
            icon: "Mail",
            color: "#07d50a"
          },
          {
            id: "coe-recorder-list",
            name: "COE Recorder List",
            url: "https://docs.google.com/spreadsheets/d/1W0rcxmZNfa2Ly5qUblWEL4P31i9eNkJr-UNTGCdczv8/edit?gid=0#gid=0",
            icon: "Award",
            color: "#df28e2"
          },
          {
            id: "comment-box-probation",
            name: "Comment Box and Probation",
            url: "https://docs.google.com/spreadsheets/d/1zIOd6K8No_r6GMr9x4Ilsqeci64sM6phChhC2z2ADbA/edit?usp=sharing",
            icon: "MessageSquare",
            color: "#d913dd"
          },
          {
            id: "disciplinary-at-campus",
            name: "Disciplinary at Campus",
            url: "https://docs.google.com/spreadsheets/d/1jtULGK0PVEHzpRYviLpoV-Y0aaLeydNPP0TxmPV-G78/edit?gid=1085534083#gid=1085534083",
            icon: "Scale",
            color: "#d917d9"
          },
          {
            id: "disciplinary-actions-recorder",
            name: "Disciplinary Actions Recorder",
            url: "https://docs.google.com/spreadsheets/d/1_fgXVPcc1DK-xL9tZ8CbJCGVc929iAzkD0tcGU0Gf1Q/edit?gid=297067183#gid=297067183",
            icon: "BookOpen",
            color: "#c70de7"
          },
          {
            id: "visa-extension-campus",
            name: "Visa Extension at Campus",
            url: "https://docs.google.com/spreadsheets/d/1_z2P_yCBn77C4e1T80aSGbBUopTe-6CBo2u-h6RV9bs/edit?gid=1095851712#gid=1095851712",
            icon: "FileText",
            color: "#e10ee1"
          },
          {
            id: "visa-extension-list",
            name: "Visa Extension List",
            url: "https://docs.google.com/spreadsheets/d/1Yp3By5bWL52BstrB5Mj2aVMkT_wQ_H5c8gfW_Bq84Ts/edit",
            icon: "Globe",
            color: "#d80ec7"
          },
          {
            id: "deduction-wp-newcomer",
            name: "Deduction WP for New Comer",
            url: "https://docs.google.com/spreadsheets/d/18lHWczg7UbkNm-SDWP99owJNZjUHNsUlEfCfhqdY0IQ/edit?gid=1916416310#gid=1916416310",
            icon: "UserMinus",
            color: "#ca12ca"
          },
          {
            id: "deduction-wp-visa",
            name: "Deduction WP & VISA",
            url: "https://docs.google.com/spreadsheets/d/1_hjgREMndCa5jGCLDb5Q3sgRQJBRWiUTXlwO6PLdxxQ/edit?gid=209712021#gid=209712021",
            icon: "MinusCircle",
            color: "#cb17cf"
          },
          {
            id: "inspect-for-campuses",
            name: "Inspect for Campuses",
            url: "https://docs.google.com/spreadsheets/d/1UCeA1Ep-zOcXKUOSGLBK9sT3ydHa8b4hDwznT52VWHI/edit?gid=0#gid=0",
            icon: "Eye",
            color: "#d818c8"
          },
          {
            id: "idr-team-kpi",
            name: "IDR (HR Team's KPI)",
            url: "https://docs.google.com/spreadsheets/d/1xH49rJSfO-7So3iSnwaAwNoAd6z2Yj48SysAypEUoeI/edit?gid=10226855#gid=10226855",
            icon: "Sparkles",
            color: "#d107d5"
          },
          {
            id: "positions-codes",
            name: "Positions & Codes",
            url: "https://docs.google.com/spreadsheets/d/1qj_S7xNEQqiKN5jLqd9t4kxP5td6tBFp70Ku5TSV7go/edit?gid=1435643294#gid=1435643294",
            icon: "GitBranch",
            color: "#c91dc1"
          },
          {
            id: "hr-check-list",
            name: "HR Check List",
            url: "https://docs.google.com/spreadsheets/d/1jdeFxWvDEPyFNRi91p2gH4oqPMp0t0aqwNLsSRGeSac/edit?gid=1312084839#gid=1312084839",
            icon: "ClipboardList",
            color: "#d31ad3"
          },
          {
            id: "foreign-staff-teacher",
            name: "Foreign Staff and Teacher List",
            url: "https://docs.google.com/spreadsheets/d/1LrtcCttpTjFzF0PR8HlxILKdzGgk2mrHAX4TxiKDeEE/edit?sharingaction=ownershiptransfer&gid=1225164240#gid=1225164240",
            icon: "Map",
            color: "#d917d9"
          },
          {
            id: "generate-qr-codes",
            name: "Generate QR Codes",
            url: "https://docs.google.com/spreadsheets/d/1-RcDOiERiSjCTsvEFmYPlV84OcIoKitOHbvS4lsI7p8/edit?gid=763269812#gid=763269812",
            icon: "QrCode",
            color: "#c322c3"
          },
          {
            id: "memo-policies",
            name: "Memo & Policies",
            url: "https://docs.google.com/spreadsheets/d/10Ks9ptj_31KMcokBE2RdxXYKb9aEJtastEOJtnbbUB8/edit?gid=0#gid=0",
            icon: "FileText",
            color: "#bb16ad"
          },
          {
            id: "backup-drive",
            name: "Backup Drive",
            url: "https://drive.google.com/drive/u/0/home",
            icon: "HardDrive",
            color: "#db1adb"
          },
          {
            id: "hr-forms",
            name: "HR Forms",
            url: "https://docs.google.com/spreadsheets/d/1WiViSC9M1J64OtUh39NULEXfmABpQiDq8XPbz3O6c1A/edit#gid=1074495762",
            icon: "FileSpreadsheet",
            color: "#07d530"
          },
          {
            id: "candidate-recorder-list",
            name: "Candidate Recorder List",
            url: "https://docs.google.com/spreadsheets/d/1S_De_j8gM-mo9oRM5qkUNRZYZNOpScKeUZp5UIypidg/edit?gid=303895443#gid=303895443",
            icon: "Users",
            color: "#33d307"
          },
          {
            id: "manpower-request-report",
            name: "Manpower Request Report",
            url: "https://docs.google.com/spreadsheets/d/1jeQz3-TDazAJdWyLdAaOv4PJIP_D6O1pgG8rdA1vXSw/edit?gid=478275885#gid=478275885",
            icon: "FileText",
            color: "#14d307"
          },
          {
            id: "candidate-questionnaire",
            name: "Candidate Questionnaire",
            url: "https://docs.google.com/spreadsheets/d/1NCYICq8R8GqcyD6HZNRgEL28QjGfUJc1525Qeo0Gwvg/edit?gid=1625860229#gid=1625860229",
            icon: "HelpCircle",
            color: "#07d560"
          }
        ]
      },
      {
        id: "finance",
        title: "Finance",
        color: "#f59e0b",
        items: [
          {
            id: "resignation-list",
            name: "Resignation List",
            url: "https://docs.google.com/spreadsheets/d/1TbicDtSZz8pZrsQ8nedLuboy8C_UBDzbF9wBN3YMVxI/edit#gid=848162221",
            icon: "UserMinus",
            color: "#d5ce07"
          },
          {
            id: "campus-resigned",
            name: "Campus Resigned",
            url: "https://docs.google.com/spreadsheets/d/1i1rkXEklrFmFpS3YqP58G_EyhqilCSTuXUz-2HB9PM8/edit?gid=558565340#gid=558565340",
            icon: "Home",
            color: "#d5ce07"
          },
          {
            id: "ml-ul-ot-deduction",
            name: "ML, UL, OT, & Deduction",
            url: "https://docs.google.com/spreadsheets/d/1xfF47wKpgZaV8swAkFBrOTxcvR8whciXS4v6zCpa0aw/edit?gid=1028742123#gid=1028742123",
            icon: "Calculator",
            color: "#c7d507"
          },
          {
            id: "mnl-un-deduction-finance",
            name: "MNL, UN, Deduction for Finance",
            url: "https://docs.google.com/spreadsheets/d/1T_Upt2-dDas12sOwJRed_2Um-mvIgNG3OL_y9-cX5jU/edit",
            icon: "Coins",
            color: "#c7d507"
          },
          {
            id: "documents-for-finance",
            name: "Documents for Finance",
            url: "https://docs.google.com/spreadsheets/d/1hESQfT4CVWQHMeOhsq3J95v1gtgGRMl4mb1UgxyqBfE/edit?gid=66888056#gid=66888056",
            icon: "FolderOpen",
            color: "#c7d507"
          },
          {
            id: "payroll-reports",
            name: "Payroll Reports",
            url: "https://docs.google.com/spreadsheets/d/EXAMPLE_LINK",
            icon: "FileDollarSign",
            color: "#bad822"
          },
          {
            id: "online-timesheet",
            name: "Online Timesheet",
            url: "https://docs.google.com/spreadsheets/d/1XZNuft4Db7YK_as1Ul5lokjdCT7EBYCFsXc84Q8gBzc/edit?gid=1077978785#gid=1077978785",
            icon: "Cloud",
            color: "#b2d507"
          },
          {
            id: "gep-timesheet",
            name: "GEP Timesheet",
            url: "https://docs.google.com/spreadsheets/d/1UPY7o-bShnozwF0DLEuSHqiwMWHIIiQUkjmI-KUhSAo/edit?gid=1077978785#gid=1077978785",
            icon: "Clock",
            color: "#d1d307"
          },
          {
            id: "gep-master-list",
            name: "GEP Master List",
            url: "https://docs.google.com/spreadsheets/d/13TXMxtxBfsx4ZIyy0aSjmx5P18rPgmgKE0YCHL2a-OU/edit?gid=2012951015#gid=2012951015",
            icon: "List",
            color: "#c7d507"
          },
          {
            id: "salary-approval-transfer",
            name: "Salary Approval & Transfer",
            url: "https://docs.google.com/spreadsheets/d/1-I2qPW53Ind1Eo-VdGjoNqMicx9WOoTw7PPSJwSnlvg/edit?gid=1401819849#gid=1401819849",
            icon: "DollarSign",
            color: "#b2d507"
          },
          {
            id: "internal-budget-request",
            name: "Internal Budget Request Record",
            url: "https://docs.google.com/spreadsheets/d/17OGPjJadrAqvsFo37z8ePRT83E5rNoSU-UFProHbirw/edit?gid=756486020#gid=756486020",
            icon: "File",
            color: "#b8ba3b"
          },
          {
            id: "reduce-tax-change-status",
            name: "Reduce Tax & Change Status",
            url: "https://docs.google.com/spreadsheets/d/1LDGbXjgQlynxjFzpccoGJUns5S1NblA2epJyGfrGCsQ/edit?gid=35874519#gid=35874519",
            icon: "FileDollarSign",
            color: "#bdd507"
          },
          {
            id: "main-master-list-excel",
            name: "Main Master List Excel",
            url: "https://westernedukh-my.sharepoint.com/personal/hrgeneral_western_edu_kh/_layouts/15/AccessDenied.aspx?Source=https%3A%2F%2Fwesternedukh-my.sharepoint.com%2F%3Ax%3A%2Fr%2Fpersonal%2Fhrgeneral_western_edu_kh%2F_layouts%2F15%2FDoc.aspx%3Fsourcedoc%3D%257B1953EDB3-7BE6-44AE-ACFA-EFD1A8DC9FD6%257D%26file%3DHR%2520Master%2520List%2520Updated%25202023%252C%2520Onward.xlsx%26action%3Ddefault%26mobileredirect%3Dtrue&correlation=7f0016a2-20d2-7000-a8b1-1280ce9d9f7e&Type=item&name=bd37fb7e-9be1-4c4a-aae6-66774909ad3a&listItemId=3839&listItemUniqueId=1953edb3-7be6-44ae-acfa-efd1a8dc9fd6&allowautoredirecttosource=true",
            icon: "Table",
            color: "#d1d307"
          },
          {
            id: "teachers-hours-status",
            name: "Teacher's Hours & Status",
            url: "https://docs.google.com/spreadsheets/d/1rVGYjYSDhz_MKE9M2Gw-R8VL9GREsvyemNFSULCyrK0/edit",
            icon: "UserCheck",
            color: "#a8d307"
          },
          {
            id: "monthly-payroll-list",
            name: "Monthly Payroll List",
            url: "https://docs.google.com/spreadsheets/d/15GlMvexr2EeLcs4__7RPwrJt3Ht2cbTogAIGcSM1Ghk/edit?gid=0#gid=0",
            icon: "CreditCard",
            color: "#bdd507"
          },
          {
            id: "market-survey",
            name: "Market Survey",
            url: "https://docs.google.com/spreadsheets/d/1CEvI_8yik7ZQ2X129Zb3thBpRsRWPwCjxtUxVKcQaXo/edit?gid=585116447#gid=585116447",
            icon: "BarChart",
            color: "#c7d507"
          },
          {
            id: "gep-student-stats",
            name: "GEP Student Statistics",
            url: "https://docs.google.com/spreadsheets/d/11PmBzoLLlOxS2pev31dr6_ZSgqeNKsSdC_SxpflXXm4/edit?gid=174746097#gid=174746097",
            icon: "GraduationCap",
            color: "#d1d307"
          }
        ]
      },
      {
        id: "academics",
        title: "Academics",
        color: "#8b5cf6",
        items: [
          {
            id: "hr-orientation",
            name: "HR Orientation",
            url: "https://docs.google.com/presentation/d/1LhnVu9hOTcVg0bdoJ9_wPq52yV6yz5YzpUTQ9ZDn25Q/edit",
            icon: "Presentation",
            color: "#d3076a"
          },
          {
            id: "training-recorder",
            name: "Training Recorder",
            url: "https://docs.google.com/spreadsheets/d/EXAMPLE_LINK",
            icon: "Book",
            color: "#d30775"
          },
          {
            id: "individual-training-recorder",
            name: "Individual Training Recorder",
            url: "https://docs.google.com/spreadsheets/d/1iqhAL6tKVFY34YcPNaJ54uJi_AT5QDiszzddFo0Oo9Y/edit?gid=0#gid=0",
            icon: "BookOpen",
            color: "#d3076a"
          },
          {
            id: "training-development",
            name: "Training & Development",
            url: "https://www.canva.com/design/DAGpcaiICBc/JhWk-yed1gZQSVG_Zlm3Sg/view?utm_content=DAGpcaiICBc&utm_campaign=designshare&utm_medium=link2&utm_source=uniquelinks&utlId=h7808b794ef",
            icon: "TrendingUp",
            color: "#d3071b"
          },
          {
            id: "evaluation-training-report",
            name: "Evaluation Training Report",
            url: "https://docs.google.com/spreadsheets/d/11Tuqykns9diYthCB9MTcn_gOYx6Yqe1omjSofkjvavc/edit?resourcekey=&gid=1363430949#gid=1363430949",
            icon: "Briefcase",
            color: "#d3074f"
          },
          {
            id: "new-foreign-teacher-staff",
            name: "New Foreign Teacher & Staff",
            url: "https://docs.google.com/spreadsheets/d/1xdH-z7aWoANNE_jhxPWgR1Knn5YFf_NYLco_0w-r-j4/edit?gid=1109946808#gid=1109946808",
            icon: "UserPlus",
            color: "#d3071b"
          }
        ]
      }
    ],
    sectionOrder: ["operations", "finance", "academics"],
    profile: {
      name: "John Doe",
      role: "HR Administrator",
      avatarInitials: "JD"
    },
    theme: {
      themeName: 'dark',
      colors: {
        '--primary': '#0f172a',
        '--bg': '#0b1120',
        '--text': '#f1f5f9',
        '--text-muted': '#94a3b8',
        '--accent': '#06b6d4',
        '--accent2': '#14b8a6',
        '--accent3': '#8b5cf6',
        '--secondary': '#1e3a8a',
        '--surface': 'rgba(15, 23, 42, 0.75)',
        '--glass-border': 'rgba(255, 255, 255, 0.1)'
      },
      itemScale: 100,
      backgroundImage: null
    },
    syncDoc: {
      sheetId: '13u2FyO_d2BvXJaVoeNlBf0BGY-AihNlf-GKO4cljPqA',
      csvUrl: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vT5BUnPjs549CQtZDdO0Y8YjGK1LlHIwOfhYxg-gkSU-lfHDDnlwqzUL-ucvwx5xLSFD_R0J317-1tS/pub?output=csv',
      scriptUrl: 'https://script.google.com/macros/s/AKfycbxu7NsR7XrZ2noa9b9wjR6ILaTjQW8_aQaK9tvh63_h-UivydG2REP2i8-rfxUExP2M/exec'
    }
  };
}

// In-Memory Shared State
let sharedState: any = null;

// Read state from disk or seed default
function loadState() {
  try {
    if (fs.existsSync(STATE_FILE_PATH)) {
      const data = fs.readFileSync(STATE_FILE_PATH, "utf8");
      sharedState = JSON.parse(data);
    } else {
      sharedState = getInitialState();
      saveState(sharedState);
    }
  } catch (err) {
    console.error("Error loading persisted state, using fallback:", err);
    sharedState = getInitialState();
  }
  return sharedState;
}

// Write state securely to file
function saveState(state: any) {
  try {
    sharedState = state;
    fs.writeFileSync(STATE_FILE_PATH, JSON.stringify(state, null, 2), "utf8");
  } catch (err) {
    console.error("Error writing persisted state to file:", err);
  }
}

// Initialize state
loadState();

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '20mb' }));

  const server = http.createServer(app);

  // Active connected devices repository
  const clients = new Map<string, { ws: WebSocket; device?: DeviceSession }>();

  // Init socket server
  const wss = new WebSocketServer({ noServer: true });

  // Handle WebSocket upgrades
  server.on("upgrade", (request, socket, head) => {
    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit("connection", ws, request);
    });
  });

  // Unique client ID generator
  let idCounter = 1;

  wss.on("connection", (ws: WebSocket) => {
    const clientId = `client_${Date.now()}_${idCounter++}`;
    clients.set(clientId, { ws });

    // Send initial configuration to this client
    ws.send(JSON.stringify({
      type: "init",
      clientId,
      payload: {
        state: sharedState,
        connectedDevices: getActiveDeviceList(clientId)
      }
    }));

    // Broadcast device list change on connect
    broadcastDeviceList();

    ws.on("message", (messageStr: string) => {
      try {
        const msg: WSMessage = JSON.parse(messageStr);
        const clientRef = clients.get(clientId);

        if (!clientRef) return;

        switch (msg.type) {
          case "device_register":
            // Register details about the device/browser
            if (msg.payload) {
              clientRef.device = {
                id: clientId,
                os: msg.payload.os || "Unknown OS",
                browser: msg.payload.browser || "Unknown Browser",
                deviceType: msg.payload.deviceType || "Desktop"
              };
              // Notify everyone about active devices
              broadcastDeviceList();
            }
            break;

          case "sync_update":
            // Received layout state change, save it locally and broadcast
            if (msg.payload) {
              saveState(msg.payload);
              // Broadcast layout modification to other clients
              clients.forEach((cRef, cId) => {
                if (cId !== clientId && cRef.ws.readyState === WebSocket.OPEN) {
                  cRef.ws.send(JSON.stringify({
                    type: "sync_update",
                    payload: sharedState
                  }));
                }
              });
            }
            break;

          case "ping":
            ws.send(JSON.stringify({ type: "pong" }));
            break;
        }
      } catch (err) {
        console.error("Error processing websocket message:", err);
      }
    });

    ws.on("close", () => {
      clients.delete(clientId);
      // Broadcast update that a device offline
      broadcastDeviceList();
    });

    ws.on("error", (err) => {
      console.error(`Socket error on client ${clientId}:`, err);
      clients.delete(clientId);
      broadcastDeviceList();
    });
  });

  // Calculate connected device list with `isCurrent` property mapped specifically to recipient browser
  function getActiveDeviceList(recipientClientId: string): DeviceSession[] {
    const list: DeviceSession[] = [];
    clients.forEach((ref, id) => {
      if (ref.device) {
        list.push({
          ...ref.device,
          isCurrent: id === recipientClientId
        });
      } else {
        list.push({
          id,
          os: "Unknown",
          browser: "Client session",
          deviceType: "Desktop",
          isCurrent: id === recipientClientId
        });
      }
    });
    return list;
  }

  // Refreshes the devices list dynamically across all connected browsers
  function broadcastDeviceList() {
    clients.forEach((ref, id) => {
      if (ref.ws.readyState === WebSocket.OPEN) {
        ref.ws.send(JSON.stringify({
          type: "device_list",
          payload: getActiveDeviceList(id)
        }));
      }
    });
  }

  // HTTP API Endpoints
  app.get("/api/state", (req, res) => {
    res.json(sharedState);
  });

  app.post("/api/state", (req, res) => {
    try {
      if (req.body) {
        saveState(req.body);

        // Broadcast updates to all websockets
        clients.forEach((cRef) => {
          if (cRef.ws.readyState === WebSocket.OPEN) {
            cRef.ws.send(JSON.stringify({
              type: "sync_update",
              payload: sharedState
            }));
          }
        });

        res.json({ success: true, state: sharedState });
      } else {
        res.status(400).json({ error: "Empty state payload" });
      }
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Serve static UI assets
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  server.listen(PORT, "0.0.0.0", () => {
    console.log(`PAR Server booting. Realtime deviceline syncing on port ${PORT}`);
  });
}

startServer();
