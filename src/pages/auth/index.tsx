import { useEffect, useState } from "preact/hooks";
import "./style.css";
import { DB } from "../../db";
import { pb_schema_map } from "../../schema";
import { JSX } from "preact/jsx-runtime";
import { AuthMethodsList } from "pocketbase";

interface AuthProps {}

export function Auth(props: AuthProps) {
  const [authMethods, setAuthMethods] = useState<AuthMethodsList>();
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>();

  const [authIssue, setAuthIssue] = useState<string>();

  const [authWithPassword, setAuthWithPassword] = useState<boolean>(false);

  const [register, setRegister] = useState<boolean>(false);

  setIsLoggedIn(DB.IsLoggedIn());

  useEffect(() => {
    DB.ListAuthMethods().then((m) => {
      setAuthMethods(m);
    });
  }, [isLoggedIn]);

  let content: JSX.Element;
  if (isLoggedIn) {
    content = (
      <div class="content">
        <span>Logged In as {DB.LoggedInEmail()} </span>
        <button
          class="auth-button"
          onClick={() => {
            DB.ctx.authStore.clear();
            setIsLoggedIn(false);
          }}
        >
          Logout
        </button>
      </div>
    );
  } else {
    let am: JSX.Element[];
    if (authMethods) {
      am = [];
      if (authMethods.usernamePassword) {
        am.push(<button>Username and Password</button>);
      }
      if (authMethods.emailPassword) {
        am.push(
          <button
            class="auth-button"
            onClick={() => {
              setAuthWithPassword(true);
            }}
          >
            Email and Password
          </button>,
        );
      }
      if (authMethods.authProviders) {
        for (const p of authMethods.authProviders) {
          am.push(
            <button
              class="auth-button"
              onClick={() => {
                DB.ctx
                  .collection("users")
                  .authWithOAuth2({
                    provider: p.name,
                  })
                  .then((r) => {
                    setIsLoggedIn(true);
                  })
                  .catch((reason) => {
                    setAuthIssue(reason);
                  });
              }}
            >
              {p.displayName}
            </button>,
          );
        }
      }
    } else {
      am = [<span>Loading auth methods</span>];
    }
    content = (
      <div class="content">
        {(authWithPassword && (
          <div class="auth-username-box">
            <div class="row space-between">
              <label for="username">Username or email</label>
              <input type="text" id="username" name="username"></input>
            </div>
            <div class="row space-between">
              <label for="password">Password</label>
              <input type="password" id="password" name="password"></input>
            </div>
            <div class="row">
              <label for="register">Register</label>
              <input
                type="checkbox"
                id="register"
                checked={register}
                onChange={(evt) => {
                  setRegister((evt.target as HTMLInputElement).checked);
                }}
              ></input>
            </div>
            {register && (
              <div class="row space-between">
                <label for="confirmPassword">Confirm Password</label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                ></input>
              </div>
            )}
            <button
              class="auth-button"
              onClick={() => {
                if (register) {
                  DB.ctx
                    .collection("users")
                    .create({
                      password: (
                        document.querySelector("#password") as HTMLInputElement
                      ).value,
                      passwordConfirm: (
                        document.querySelector(
                          "#confirmPassword",
                        ) as HTMLInputElement
                      ).value,
                      email: (
                        document.querySelector("#username") as HTMLInputElement
                      ).value,
                    })
                    .then((v) => {
                      DB.ctx
                        .collection("users")
                        .authWithPassword(
                          (
                            document.querySelector(
                              "#username",
                            ) as HTMLInputElement
                          ).value,
                          (
                            document.querySelector(
                              "#password",
                            ) as HTMLInputElement
                          ).value,
                        )
                        .then((r) => {
                          setIsLoggedIn(true);
                        })
                        .catch((reason) => {
                          setAuthIssue(reason);
                        });
                    })
                    .catch((reason) => {
                      console.log(reason);
                      setAuthIssue(reason);
                    });
                } else {
                  DB.ctx
                    .collection("users")
                    .authWithPassword(
                      (document.querySelector("#username") as HTMLInputElement)
                        .value,
                      (document.querySelector("#password") as HTMLInputElement)
                        .value,
                    )
                    .then((r) => {
                      setIsLoggedIn(true);
                    })
                    .catch((reason) => {
                      setAuthIssue(reason);
                    });
                }
              }}
            >
              Submit
            </button>
            <button
              onClick={() => {
                setAuthWithPassword(false);
              }}
              class="auth-button"
            >
              Use another method
            </button>
          </div>
        )) || (
          <div class="auth-username-box">
            <span>You're not authenticated.</span>
            <span>You can authenticate using these methods:</span>
            <div class="auth-methods">{am}</div>
          </div>
        )}
      </div>
    );
  }
  return (
    <div class="auth">
      <h2>Authentication</h2>
      {content}
      {authIssue !== undefined && <span>{authIssue.toString()}</span>}
    </div>
  );
}
