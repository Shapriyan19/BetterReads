const passwordcheck=[
    {
      id: 0,
      value: "Too weak",
      minDiversity: 0,
      minLength: 0
    },
    {
      id: 1,
      value: "Weak",
      minDiversity: 2,
      minLength: 6
    },
    {
      id: 2,
      value: "Medium",
      minDiversity: 4,
      minLength: 8
    },
    {
      id: 3,
      value: "Strong",
      minDiversity: 4,
      minLength: 10
    }
  ];

export default passwordcheck;