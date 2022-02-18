export type InfinityDrakeStaking = {
  "version": "0.1.0",
  "name": "infinity_drake_staking",
  "instructions": [
    {
      "name": "initVault",
      "accounts": [
        {
          "name": "vault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "user",
          "isMut": false,
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
          "name": "bump",
          "type": "u8"
        }
      ]
    },
    {
      "name": "createUserPool",
      "accounts": [
        {
          "name": "pool",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "poolSigner",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "user",
          "isMut": false,
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
          "name": "bump1",
          "type": "u8"
        },
        {
          "name": "bump2",
          "type": "u8"
        }
      ]
    },
    {
      "name": "addNft",
      "accounts": [
        {
          "name": "user",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "mint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "pool",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "from",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "to",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "method",
          "type": "u8"
        },
        {
          "name": "drakeType",
          "type": "u8"
        }
      ]
    },
    {
      "name": "claimNft",
      "accounts": [
        {
          "name": "pool",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "poolSigner",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "vault",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "user",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "mint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "nftFrom",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "nftTo",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenFrom",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenTo",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "bump1",
          "type": "u8"
        },
        {
          "name": "bump2",
          "type": "u8"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "pool",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "user",
            "type": "publicKey"
          },
          {
            "name": "nfts",
            "type": {
              "vec": {
                "defined": "NftInfo"
              }
            }
          },
          {
            "name": "size",
            "type": "u32"
          },
          {
            "name": "bump",
            "type": "u8"
          },
          {
            "name": "bumpSigner",
            "type": "u8"
          }
        ]
      }
    }
  ],
  "types": [
    {
      "name": "NftInfo",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "mint",
            "type": "publicKey"
          },
          {
            "name": "startDate",
            "type": "u32"
          },
          {
            "name": "endDate",
            "type": "u32"
          },
          {
            "name": "method",
            "type": "u8"
          },
          {
            "name": "drakeType",
            "type": "u8"
          },
          {
            "name": "amount",
            "type": "u64"
          }
        ]
      }
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "MethodOutRange",
      "msg": "Land method is out of range."
    },
    {
      "code": 6001,
      "name": "DrakeTypeOutRange",
      "msg": "Drake type is out of range."
    },
    {
      "code": 6002,
      "name": "PoolOwnerInvalid",
      "msg": "User is not pool owner."
    },
    {
      "code": 6003,
      "name": "VaultInvalid",
      "msg": "Vault is invalid."
    },
    {
      "code": 6004,
      "name": "TokenNotExist",
      "msg": "Token doesn't exist."
    },
    {
      "code": 6005,
      "name": "StakingLocked",
      "msg": "Staking is locked."
    }
  ]
};

export const IDL: InfinityDrakeStaking = {
  "version": "0.1.0",
  "name": "infinity_drake_staking",
  "instructions": [
    {
      "name": "initVault",
      "accounts": [
        {
          "name": "vault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "user",
          "isMut": false,
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
          "name": "bump",
          "type": "u8"
        }
      ]
    },
    {
      "name": "createUserPool",
      "accounts": [
        {
          "name": "pool",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "poolSigner",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "user",
          "isMut": false,
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
          "name": "bump1",
          "type": "u8"
        },
        {
          "name": "bump2",
          "type": "u8"
        }
      ]
    },
    {
      "name": "addNft",
      "accounts": [
        {
          "name": "user",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "mint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "pool",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "from",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "to",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "method",
          "type": "u8"
        },
        {
          "name": "drakeType",
          "type": "u8"
        }
      ]
    },
    {
      "name": "claimNft",
      "accounts": [
        {
          "name": "pool",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "poolSigner",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "vault",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "user",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "mint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "nftFrom",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "nftTo",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenFrom",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenTo",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "bump1",
          "type": "u8"
        },
        {
          "name": "bump2",
          "type": "u8"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "pool",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "user",
            "type": "publicKey"
          },
          {
            "name": "nfts",
            "type": {
              "vec": {
                "defined": "NftInfo"
              }
            }
          },
          {
            "name": "size",
            "type": "u32"
          },
          {
            "name": "bump",
            "type": "u8"
          },
          {
            "name": "bumpSigner",
            "type": "u8"
          }
        ]
      }
    }
  ],
  "types": [
    {
      "name": "NftInfo",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "mint",
            "type": "publicKey"
          },
          {
            "name": "startDate",
            "type": "u32"
          },
          {
            "name": "endDate",
            "type": "u32"
          },
          {
            "name": "method",
            "type": "u8"
          },
          {
            "name": "drakeType",
            "type": "u8"
          },
          {
            "name": "amount",
            "type": "u64"
          }
        ]
      }
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "MethodOutRange",
      "msg": "Land method is out of range."
    },
    {
      "code": 6001,
      "name": "DrakeTypeOutRange",
      "msg": "Drake type is out of range."
    },
    {
      "code": 6002,
      "name": "PoolOwnerInvalid",
      "msg": "User is not pool owner."
    },
    {
      "code": 6003,
      "name": "VaultInvalid",
      "msg": "Vault is invalid."
    },
    {
      "code": 6004,
      "name": "TokenNotExist",
      "msg": "Token doesn't exist."
    },
    {
      "code": 6005,
      "name": "StakingLocked",
      "msg": "Staking is locked."
    }
  ]
};
