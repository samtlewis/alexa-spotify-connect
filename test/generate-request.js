module.exports = {
    intentRequest: function (intentName, slots, accessToken) {
        return {
            "session": {
                "application": {
                    "applicationId": "amzn1.ask.skill.cff2d0af-01a4-4e24-a05d-4e6b641abd48"
                },
                "user": {
                    "accessToken": accessToken || null
                }
            },
            "request": {
                "type": "IntentRequest",
                "intent": {
                    "name": intentName || "",
                    "slots": slots || {}
                }
            },
            "context": {
                "System": {
                    "application": {
                        "applicationId": "amzn1.ask.skill.cff2d0af-01a4-4e24-a05d-4e6b641abd48"
                    },
                    "user": {
                        "userId": "amzn1.ask.account.VOID",
                        "accessToken": accessToken || null
                    }
                }
            }
        }
    },
    intentRequestSessionAttributes: function (intentName, sessionAttributes, slots, accessToken, newSession, locale) {
        return {
            "session": {
                "new": newSession || false,
                "application": {
                    "applicationId": "amzn1.ask.skill.cff2d0af-01a4-4e24-a05d-4e6b641abd48"
                },
                "user": {
                    "accessToken": accessToken || null
                },
                "attributes": sessionAttributes || {}
            },
            "request": {
                "type": "IntentRequest",
                "intent": {
                    "name": intentName || "",
                    "slots": slots || {}
                },
                "locale": locale || "en-GB"
            },
            "context": {
                "System": {
                    "application": {
                        "applicationId": "amzn1.ask.skill.cff2d0af-01a4-4e24-a05d-4e6b641abd48"
                    },
                    "user": {
                        "userId": "amzn1.ask.account.VOID",
                        "accessToken": accessToken || null
                    }
                }
            }
        }
    },
    requestType: function (requestType, applicationId, locale) {
        return {
            "session": {
                "application": {
                    "applicationId": applicationId || "amzn1.ask.skill.cff2d0af-01a4-4e24-a05d-4e6b641abd48"
                },
                "user": {}
            },
            "request": {
                "type": requestType || "LaunchRequest",
                "locale": locale || "en-GB"
            },
            "context": {
                "System": {
                    "application": {},
                    "user": {}
                }
            }
        };
    },
    intentRequestNoSession: function (intentName) {
        return {
            "request": {
                "type": "IntentRequest",
                "intent": {
                    "name": intentName || ""
                }
            },
            "context": {
                "System": {
                    "application": {
                        "applicationId": "amzn1.ask.skill.cff2d0af-01a4-4e24-a05d-4e6b641abd48"
                    },
                    "user": {
                        "userId": "amzn1.ask.account.VOID",
                        "accessToken": "example-access-token"
                    }
                }
            }
        }
    }
}
