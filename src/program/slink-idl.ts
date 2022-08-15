export type Slink = {
  "version": "0.1.0",
  "name": "slink",
  "instructions": [
    {
      "name": "createObjectProfile",
      "accounts": [
        {
          "name": "objectProfile",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "creator",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "objectAddress",
          "type": "publicKey"
        }
      ]
    },
    {
      "name": "createObjectProfileAttachment",
      "accounts": [
        {
          "name": "objectProfile",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "objectProfileAttachment",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "creator",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "uri",
          "type": {
            "array": [
              "u8",
              128
            ]
          }
        },
        {
          "name": "sha256Hash",
          "type": {
            "array": [
              "u8",
              64
            ]
          }
        }
      ]
    },
    {
      "name": "createObjectsRelation",
      "accounts": [
        {
          "name": "objectAProfile",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "objectBProfile",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "objectsRelation",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "creator",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "createObjectsRelationAttachment",
      "accounts": [
        {
          "name": "objectsRelation",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "objectsRelationAttachment",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "creator",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "uri",
          "type": {
            "array": [
              "u8",
              128
            ]
          }
        },
        {
          "name": "sha256Hash",
          "type": {
            "array": [
              "u8",
              64
            ]
          }
        }
      ]
    },
    {
      "name": "createAcknowledgment",
      "accounts": [
        {
          "name": "objectsRelationAc",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "objectsRelationBc",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "objectProfileAttachment",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "acknowledgement",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "creator",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "profileAddress",
          "type": "publicKey"
        },
        {
          "name": "attachmentIndex",
          "type": "u8"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "objectProfile",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "objectAddress",
            "type": "publicKey"
          },
          {
            "name": "authority",
            "type": "publicKey"
          },
          {
            "name": "nextAttachmentIndex",
            "type": "u8"
          },
          {
            "name": "createdAt",
            "type": "u32"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "objectsRelation",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "objectAProfileAddress",
            "type": "publicKey"
          },
          {
            "name": "objectBProfileAddress",
            "type": "publicKey"
          },
          {
            "name": "createdBy",
            "type": "publicKey"
          },
          {
            "name": "nextAttachmentIndex",
            "type": "u8"
          },
          {
            "name": "createdAt",
            "type": "u32"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "attachment",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "entityAddress",
            "type": "publicKey"
          },
          {
            "name": "uri",
            "type": {
              "array": [
                "u8",
                128
              ]
            }
          },
          {
            "name": "sha256Hash",
            "type": {
              "array": [
                "u8",
                64
              ]
            }
          },
          {
            "name": "createdBy",
            "type": "publicKey"
          },
          {
            "name": "index",
            "type": "u8"
          },
          {
            "name": "createdAt",
            "type": "u32"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "acknowledgment",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "entityAddress",
            "type": "publicKey"
          },
          {
            "name": "createdBy",
            "type": "publicKey"
          },
          {
            "name": "index",
            "type": "u8"
          },
          {
            "name": "createdAt",
            "type": "u32"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "AuthorizationError"
    },
    {
      "code": 6001,
      "name": "ProfilesNotLinkedError"
    },
    {
      "code": 6002,
      "name": "CyclicLinkError"
    }
  ]
};

export const IDL: Slink = {
  "version": "0.1.0",
  "name": "slink",
  "instructions": [
    {
      "name": "createObjectProfile",
      "accounts": [
        {
          "name": "objectProfile",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "creator",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "objectAddress",
          "type": "publicKey"
        }
      ]
    },
    {
      "name": "createObjectProfileAttachment",
      "accounts": [
        {
          "name": "objectProfile",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "objectProfileAttachment",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "creator",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "uri",
          "type": {
            "array": [
              "u8",
              128
            ]
          }
        },
        {
          "name": "sha256Hash",
          "type": {
            "array": [
              "u8",
              64
            ]
          }
        }
      ]
    },
    {
      "name": "createObjectsRelation",
      "accounts": [
        {
          "name": "objectAProfile",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "objectBProfile",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "objectsRelation",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "creator",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "createObjectsRelationAttachment",
      "accounts": [
        {
          "name": "objectsRelation",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "objectsRelationAttachment",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "creator",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "uri",
          "type": {
            "array": [
              "u8",
              128
            ]
          }
        },
        {
          "name": "sha256Hash",
          "type": {
            "array": [
              "u8",
              64
            ]
          }
        }
      ]
    },
    {
      "name": "createAcknowledgment",
      "accounts": [
        {
          "name": "objectsRelationAc",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "objectsRelationBc",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "objectProfileAttachment",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "acknowledgement",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "creator",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "profileAddress",
          "type": "publicKey"
        },
        {
          "name": "attachmentIndex",
          "type": "u8"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "objectProfile",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "objectAddress",
            "type": "publicKey"
          },
          {
            "name": "authority",
            "type": "publicKey"
          },
          {
            "name": "nextAttachmentIndex",
            "type": "u8"
          },
          {
            "name": "createdAt",
            "type": "u32"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "objectsRelation",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "objectAProfileAddress",
            "type": "publicKey"
          },
          {
            "name": "objectBProfileAddress",
            "type": "publicKey"
          },
          {
            "name": "createdBy",
            "type": "publicKey"
          },
          {
            "name": "nextAttachmentIndex",
            "type": "u8"
          },
          {
            "name": "createdAt",
            "type": "u32"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "attachment",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "entityAddress",
            "type": "publicKey"
          },
          {
            "name": "uri",
            "type": {
              "array": [
                "u8",
                128
              ]
            }
          },
          {
            "name": "sha256Hash",
            "type": {
              "array": [
                "u8",
                64
              ]
            }
          },
          {
            "name": "createdBy",
            "type": "publicKey"
          },
          {
            "name": "index",
            "type": "u8"
          },
          {
            "name": "createdAt",
            "type": "u32"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "acknowledgment",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "entityAddress",
            "type": "publicKey"
          },
          {
            "name": "createdBy",
            "type": "publicKey"
          },
          {
            "name": "index",
            "type": "u8"
          },
          {
            "name": "createdAt",
            "type": "u32"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "AuthorizationError"
    },
    {
      "code": 6001,
      "name": "ProfilesNotLinkedError"
    },
    {
      "code": 6002,
      "name": "CyclicLinkError"
    }
  ]
};
