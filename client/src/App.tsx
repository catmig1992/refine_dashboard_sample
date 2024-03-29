import {
  AuthBindings,
  Authenticated,
  // GitHubBanner,
  Refine,
} from "@refinedev/core";
import { DevtoolsProvider } from "@refinedev/devtools";
// import { DevtoolsPanel } from "@refinedev/devtools";
import { RefineKbar, RefineKbarProvider } from "@refinedev/kbar";
// import { MuiInferencer } from "@refinedev/inferencer/mui";

import {
  ErrorComponent,
  notificationProvider,
  RefineSnackbarProvider,
  // ThemedLayoutV2,
} from "@refinedev/mui";

import CssBaseline from "@mui/material/CssBaseline";
import GlobalStyles from "@mui/material/GlobalStyles";
import routerBindings, {
  CatchAllNavigate,
  DocumentTitleHandler,
  NavigateToResource,
  UnsavedChangesNotifier,
} from "@refinedev/react-router-v6";
import dataProvider from "@refinedev/simple-rest";
// import routerProvider from "@refinedev/react-router-v6/legacy";
// added Nov. 13
import axios, { AxiosRequestConfig } from "axios";
import { CredentialResponse } from "interfaces/google";
// import {
//   BlogPostCreate,
//   BlogPostEdit,
//   BlogPostList,
//   BlogPostShow,
// } from "pages/blog-posts";
// import {
//   CategoryCreate,
//   CategoryEdit,
//   CategoryList,
//   CategoryShow,
// } from "pages/categories";
import { BrowserRouter, Outlet, Route, Routes } from "react-router-dom";
import { parseJwt } from "utils/parse-jwt";
// import { Header } from "./components";
import { ColorModeContextProvider } from "./contexts/color-mode";

import {
  AccountCircleOutlined,
  ChatBubbleOutlined,
  PeopleAltOutlined,
  StarOutlineRounded,
  VillaOutlined,
  DashboardOutlined,
} from "@mui/icons-material";

import { ThemedLayoutV2 } from "components/layout";
import { ThemedHeaderV2 } from "components/layout/header";
import { ThemedSiderV2 } from "components/layout/sider";
import { ThemedTitleV2 } from "components/layout/title";

import {
  Login,
  DashboardPage,
  Agents,
  MyProfile,
  PropertyDetails,
  AllProperties,
  CreateProperty,
  AgentProfile,
  EditProperty,
} from "pages";

const axiosInstance = axios.create();
axiosInstance.interceptors.request.use((request: AxiosRequestConfig) => {
  const token = localStorage.getItem("token");
  if (request.headers) {
    request.headers["Authorization"] = `Bearer ${token}`;
  } else {
    request.headers = {
      Authorization: `Bearer ${token}`,
    };
  }

  return request;
});

function App() {
  const authProvider: AuthBindings = {
    login: async ({ credential }: CredentialResponse) => {
      const profileObj = credential ? parseJwt(credential) : null;

      //Save user to MongoDB...
      if (profileObj) {
        const response = await fetch(
          "https://refine-dashboard-sample.onrender.com/api/v1/users",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: profileObj.name,
              email: profileObj.email,
              avatar: profileObj.picture,
            }),
          }
        );

        const data = await response.json();

        if (response.status === 200) {
          localStorage.setItem(
            "user",
            JSON.stringify({
              ...profileObj,
              avatar: profileObj.picture,
              userid: data._id,
            })
          );
        } else {
          return Promise.reject();
        }
      }

      localStorage.setItem("token", `${credential}`);

      return {
        success: true,
        redirectTo: "/",
      };

      // return {
      //   success: false,
      // };
    },
    logout: async () => {
      const token = localStorage.getItem("token");

      if (token && typeof window !== "undefined") {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        axios.defaults.headers.common = {};
        window.google?.accounts.id.revoke(token, () => {
          return {};
        });
      }

      return {
        success: true,
        redirectTo: "/login",
      };
    },

    onError: async (error) => {
      console.error(error);
      return { error };
    },

    check: async () => {
      const token = localStorage.getItem("token");

      if (token) {
        return {
          authenticated: true,
        };
      }

      return {
        authenticated: false,
        error: {
          message: "Check failed",
          name: "Token not found",
        },
        logout: true,
        redirectTo: "/login",
      };
    },

    getPermissions: async () => null,

    getIdentity: async () => {
      const user = localStorage.getItem("user");
      if (user) {
        return JSON.parse(user);
      }
      // return null;
    },
  };

  return (
    <BrowserRouter>
      {/* <GitHubBanner /> */}
      <RefineKbarProvider>
        <ColorModeContextProvider>
          <CssBaseline />
          <GlobalStyles styles={{ html: { WebkitFontSmoothing: "auto" } }} />
          <RefineSnackbarProvider>
            <DevtoolsProvider>
              <Refine
                dataProvider={dataProvider(
                  "https://refine-dashboard-sample.onrender.com/api/v1"
                )}
                notificationProvider={notificationProvider}
                routerProvider={routerBindings}
                authProvider={authProvider}
                resources={[
                  {
                    name: "dashboard",
                    list: "/",
                    meta: {
                      label: "Dashboard",
                      icon: <DashboardOutlined />,
                    },
                  },
                  {
                    name: "properties",
                    list: AllProperties,
                    show: PropertyDetails,
                    create: CreateProperty,
                    edit: EditProperty,
                    icon: <VillaOutlined />,
                    meta: { canDelete: true },
                  },
                  {
                    name: "agents",
                    list: Agents,
                    show: AgentProfile,
                    icon: <PeopleAltOutlined />,
                  },
                  {
                    name: "reviews",
                    list: "/reviews",
                    icon: <StarOutlineRounded />,
                  },
                  {
                    name: "messages",
                    list: "/messages",
                    icon: <ChatBubbleOutlined />,
                  },
                  {
                    name: "my-profile",
                    options: { label: "My Profile" },
                    list: MyProfile,
                    icon: <AccountCircleOutlined />,
                  },
                ]}
                options={{
                  syncWithLocation: true,
                  warnWhenUnsavedChanges: true,
                  projectId: "olqp9E-BD4z9G-ZFWyRW",
                }}
              >
                <Routes>
                  <Route
                    element={
                      <Authenticated
                        key="authenticated-inner"
                        fallback={<CatchAllNavigate to="/login" />}
                      >
                        <ThemedLayoutV2
                          // Header={() => <Header isSticky={true} />}
                          Header={ThemedHeaderV2}
                          Sider={ThemedSiderV2}
                          Title={ThemedTitleV2}
                        >
                          <Outlet />
                        </ThemedLayoutV2>
                      </Authenticated>
                    }
                  >
                    <Route index element={<DashboardPage />} />
                    <Route path="/properties">
                      <Route index element={<AllProperties />} />
                      <Route path="create" element={<CreateProperty />} />
                      <Route path="edit/:id" element={<EditProperty />} />
                      <Route path="show/:id" element={<PropertyDetails />} />
                    </Route>
                    <Route path="/agents">
                      <Route index element={<Agents />} />
                      <Route path="show/:id" element={<AgentProfile />} />
                    </Route>
                    <Route path="/reviews" index element={<DashboardPage />} />
                    <Route path="/messages" index element={<DashboardPage />} />
                    <Route path="/my-profile">
                      <Route index element={<MyProfile />} />
                    </Route>
                    {/* <Route
                      index
                      element={<NavigateToResource resource="blog_posts" />}
                    />
                    <Route path="/blog-posts">
                      <Route index element={<BlogPostList />} />
                      <Route path="create" element={<BlogPostCreate />} />
                      <Route path="edit/:id" element={<BlogPostEdit />} />
                      <Route path="show/:id" element={<BlogPostShow />} />
                    </Route>
                    <Route path="/categories">
                      <Route index element={<CategoryList />} />
                      <Route path="create" element={<CategoryCreate />} />
                      <Route path="edit/:id" element={<CategoryEdit />} />
                      <Route path="show/:id" element={<CategoryShow />} />
                    </Route> */}
                    <Route path="*" element={<ErrorComponent />} />
                  </Route>
                  <Route
                    element={
                      <Authenticated
                        key="authenticated-outer"
                        fallback={<Outlet />}
                      >
                        <NavigateToResource />
                      </Authenticated>
                    }
                  >
                    <Route path="/login" element={<Login />} />
                  </Route>
                </Routes>

                <RefineKbar />
                <UnsavedChangesNotifier />
                <DocumentTitleHandler />
              </Refine>
              {/* <DevtoolsPanel /> */}
            </DevtoolsProvider>
          </RefineSnackbarProvider>
        </ColorModeContextProvider>
      </RefineKbarProvider>
    </BrowserRouter>
  );
}

export default App;
