{
  "targets": [
    {
      "target_name": "numformat",
      "sources": ["lib/numformat.cc"],
      "libraries": ["<!@(icu-config --ldflags)"],
      "cflags": ["<!@(icu-config --cppflags)"],
			'cflags_cc!': [ '-fno-exceptions' ],
      "conditions": [
        ['OS=="mac"', {
          "OTHER_CFLAGS": ["<!@(icu-config --cppflags)"]
        }]
      ]
    }
  ]
}
