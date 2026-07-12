import React, { useEffect, useRef, useState } from 'react';

const SC = 0.78;
const s = (value) => Math.round(value * SC);
const SOURCE_WIDTH = 1994;
const SOURCE_HEIGHT = 1186;
const VIEW_BOX = '0 0 1994 1186';
const AREA_LABELS = {
  coffeeBar: {
    key: 'maps.drugs.dining_room',
    defaultMessage: 'Dining Room',
    note: 'Large rectangle to the left of the coffee dock, with corridor access at the top and left.',
  },
  mainHouseCorridor: {
    key: 'maps.drugs.main_house_corridor',
    defaultMessage: 'Main House Corridor',
    note: 'Long horizontal rectangle above the lower room cluster.',
  },
  greenMileStaircase: {
    key: 'maps.drugs.green_mile_staircase',
    defaultMessage: 'Green Mile Staircase',
    note: 'Stairwell enclosed by the yellow corridor extension on the right.',
  },
  anchorPoint: {
    key: 'maps.drugs.anchor_point',
    defaultMessage: 'ANCHOR POINT',
    note: 'Coffee dock protrusion and adjoining threshold area.',
  },
};
const SHAPES = [
  {
    "kind": "rect",
    "x": 0,
    "y": 0,
    "width": 1994,
    "height": 1186,
    "fill": "#F5F5F5"
  },
  {
    "kind": "rect",
    "x": 70.5,
    "y": 642.5,
    "width": 67,
    "height": 134,
    "fill": "#D9D9D9",
    "stroke": "black"
  },
  {
    "kind": "rect",
    "x": 1182.5,
    "y": 36.5,
    "width": 74,
    "height": 73,
    "fill": "#D9D9D9"
  },
  {
    "kind": "rect",
    "x": 1182.5,
    "y": 36.5,
    "width": 74,
    "height": 73,
    "stroke": "black"
  },
  {
    "kind": "rect",
    "x": 1182.5,
    "y": 36.5,
    "width": 74,
    "height": 73,
    "stroke": "black",
    "strokeOpacity": 0.2
  },
  {
    "kind": "rect",
    "x": 835.5,
    "y": 785.5,
    "width": 34,
    "height": 141,
    "fill": "#FDE68A",
    "stroke": "black",
    "areaId": "greenMileStaircase"
  },
  {
    "kind": "rect",
    "x": 716.5,
    "y": 784.5,
    "width": 118,
    "height": 38,
    "fill": "#FDE68A",
    "stroke": "black"
  },
  {
    "kind": "rect",
    "x": 748,
    "y": 823,
    "width": 19,
    "height": 1,
    "fill": "#FDE68A",
    "areaId": "anchorPoint"
  },
  {
    "kind": "rect",
    "x": 390.5,
    "y": 823.5,
    "width": 369.5,
    "height": 43,
    "fill": "#FDE68A",
    "stroke": "black"
  },
  {
    "kind": "rect",
    "x": 268.5,
    "y": 753.5,
    "width": 167,
    "height": 31,
    "fill": "#D9D9D9",
    "stroke": "black"
  },
  {
    "kind": "rect",
    "x": 268.5,
    "y": 783.5,
    "width": 49,
    "height": 83,
    "fill": "#D9D9D9",
    "stroke": "black"
  },
  {
    "kind": "rect",
    "x": 225.5,
    "y": 863.5,
    "width": 92,
    "height": 124,
    "fill": "#D9D9D9",
    "stroke": "black"
  },
  {
    "kind": "rect",
    "x": 174.5,
    "y": 863.5,
    "width": 50,
    "height": 105,
    "fill": "#D9D9D9",
    "stroke": "black"
  },
  {
    "kind": "rect",
    "x": 39.5,
    "y": 842.5,
    "width": 138,
    "height": 126,
    "fill": "#D9D9D9",
    "stroke": "black"
  },
  {
    "kind": "rect",
    "x": 70.5,
    "y": 774.5,
    "width": 67,
    "height": 67,
    "fill": "#D9D9D9",
    "stroke": "black"
  },
  {
    "kind": "rect",
    "x": 309.5,
    "y": 639.5,
    "width": 126,
    "height": 113,
    "fill": "#D9D9D9",
    "stroke": "black"
  },
  {
    "kind": "rect",
    "x": 436.5,
    "y": 639.5,
    "width": 139,
    "height": 183,
    "fill": "#D9D9D9",
    "stroke": "black"
  },
  {
    "kind": "rect",
    "x": 576.5,
    "y": 688.5,
    "width": 90,
    "height": 134,
    "fill": "#D9D9D9",
    "stroke": "black"
  },
  {
    "kind": "rect",
    "x": 193.5,
    "y": 792.5,
    "width": 77,
    "height": 23,
    "fill": "#D9D9D9",
    "stroke": "black"
  },
  {
    "kind": "rect",
    "x": 253.5,
    "y": 792.5,
    "width": 3,
    "height": 23,
    "fill": "#D9D9D9",
    "stroke": "black"
  },
  {
    "kind": "rect",
    "x": 241.5,
    "y": 792.5,
    "width": 3,
    "height": 23,
    "fill": "#D9D9D9",
    "stroke": "black"
  },
  {
    "kind": "rect",
    "x": 196.5,
    "y": 792.5,
    "width": 3,
    "height": 23,
    "fill": "#D9D9D9",
    "stroke": "black"
  },
  {
    "kind": "rect",
    "x": 202.5,
    "y": 792.5,
    "width": 3,
    "height": 23,
    "fill": "#D9D9D9",
    "stroke": "black"
  },
  {
    "kind": "rect",
    "x": 205.5,
    "y": 792.5,
    "width": 3,
    "height": 23,
    "fill": "#D9D9D9",
    "stroke": "black"
  },
  {
    "kind": "rect",
    "x": 211.5,
    "y": 792.5,
    "width": 3,
    "height": 23,
    "fill": "#D9D9D9",
    "stroke": "black"
  },
  {
    "kind": "rect",
    "x": 217.5,
    "y": 792.5,
    "width": 3,
    "height": 23,
    "fill": "#D9D9D9",
    "stroke": "black"
  },
  {
    "kind": "rect",
    "x": 223.5,
    "y": 792.5,
    "width": 3,
    "height": 23,
    "fill": "#D9D9D9",
    "stroke": "black"
  },
  {
    "kind": "rect",
    "x": 229.5,
    "y": 792.5,
    "width": 3,
    "height": 23,
    "fill": "#D9D9D9",
    "stroke": "black"
  },
  {
    "kind": "rect",
    "x": 235.5,
    "y": 792.5,
    "width": 3,
    "height": 23,
    "fill": "#D9D9D9",
    "stroke": "black"
  },
  {
    "kind": "rect",
    "x": 247.5,
    "y": 792.5,
    "width": 3,
    "height": 23,
    "fill": "#D9D9D9",
    "stroke": "black"
  },
  {
    "kind": "rect",
    "x": 265.5,
    "y": 792.5,
    "width": 2,
    "height": 23,
    "fill": "#D9D9D9",
    "stroke": "black"
  },
  {
    "kind": "rect",
    "x": 259.5,
    "y": 792.5,
    "width": 3,
    "height": 23,
    "fill": "#D9D9D9",
    "stroke": "black"
  },
  {
    "kind": "rect",
    "x": 194,
    "y": 802,
    "width": 57,
    "height": 2,
    "fill": "black"
  },
  {
    "kind": "rect",
    "x": 829.5,
    "y": 675.5,
    "width": 1,
    "height": 15,
    "fill": "#D9D9D9",
    "stroke": "black"
  },
  {
    "kind": "rect",
    "x": 859.59,
    "y": 883.534,
    "width": 41,
    "height": 15,
    "fill": "#D9D9D9",
    "stroke": "black",
    "transform": {
      "type": "rotate",
      "angle": 90.1246
    }
  },
  {
    "kind": "rect",
    "x": 859.521,
    "y": 915.534,
    "width": 1,
    "height": 15,
    "fill": "#D9D9D9",
    "stroke": "black",
    "transform": {
      "type": "rotate",
      "angle": 90.1246
    }
  },
  {
    "kind": "rect",
    "x": 859.534,
    "y": 909.534,
    "width": 1,
    "height": 15,
    "fill": "#D9D9D9",
    "stroke": "black",
    "transform": {
      "type": "rotate",
      "angle": 90.1246
    }
  },
  {
    "kind": "rect",
    "x": 859.586,
    "y": 885.534,
    "width": 1,
    "height": 15,
    "fill": "#D9D9D9",
    "stroke": "black",
    "transform": {
      "type": "rotate",
      "angle": 90.1246
    }
  },
  {
    "kind": "rect",
    "x": 859.579,
    "y": 888.534,
    "width": 1,
    "height": 15,
    "fill": "#D9D9D9",
    "stroke": "black",
    "transform": {
      "type": "rotate",
      "angle": 90.1246
    }
  },
  {
    "kind": "rect",
    "x": 859.577,
    "y": 889.534,
    "width": 2,
    "height": 15,
    "fill": "#D9D9D9",
    "stroke": "black",
    "transform": {
      "type": "rotate",
      "angle": 90.1246
    }
  },
  {
    "kind": "rect",
    "x": 859.568,
    "y": 893.534,
    "width": 1,
    "height": 15,
    "fill": "#D9D9D9",
    "stroke": "black",
    "transform": {
      "type": "rotate",
      "angle": 90.1246
    }
  },
  {
    "kind": "rect",
    "x": 859.562,
    "y": 896.534,
    "width": 1,
    "height": 15,
    "fill": "#D9D9D9",
    "stroke": "black",
    "transform": {
      "type": "rotate",
      "angle": 90.1246
    }
  },
  {
    "kind": "rect",
    "x": 859.555,
    "y": 899.534,
    "width": 1,
    "height": 15,
    "fill": "#D9D9D9",
    "stroke": "black",
    "transform": {
      "type": "rotate",
      "angle": 90.1246
    }
  },
  {
    "kind": "rect",
    "x": 859.549,
    "y": 902.534,
    "width": 2,
    "height": 15,
    "fill": "#D9D9D9",
    "stroke": "black",
    "transform": {
      "type": "rotate",
      "angle": 90.1246
    }
  },
  {
    "kind": "rect",
    "x": 859.54,
    "y": 906.534,
    "width": 1,
    "height": 15,
    "fill": "#D9D9D9",
    "stroke": "black",
    "transform": {
      "type": "rotate",
      "angle": 90.1246
    }
  },
  {
    "kind": "rect",
    "x": 859.527,
    "y": 912.534,
    "width": 1,
    "height": 15,
    "fill": "#D9D9D9",
    "stroke": "black",
    "transform": {
      "type": "rotate",
      "angle": 90.1246
    }
  },
  {
    "kind": "rect",
    "x": 859.756,
    "y": 922.284,
    "width": 0.5,
    "height": 15.5,
    "fill": "#D9D9D9",
    "stroke": "black",
    "strokeWidth": 0.5,
    "transform": {
      "type": "rotate",
      "angle": 90.1246
    }
  },
  {
    "kind": "rect",
    "x": 859.512,
    "y": 919.534,
    "width": 1,
    "height": 15,
    "fill": "#D9D9D9",
    "stroke": "black",
    "transform": {
      "type": "rotate",
      "angle": 90.1246
    }
  },
  {
    "kind": "rect",
    "x": 390.5,
    "y": 867.5,
    "width": 37,
    "height": 95,
    "fill": "#3B82F6",
    "stroke": "black"
  },
  {
    "kind": "rect",
    "x": 428.5,
    "y": 867.5,
    "width": 73,
    "height": 94,
    "fill": "#D9D9D9",
    "stroke": "black"
  },
  {
    "kind": "rect",
    "x": 620.5,
    "y": 867.5,
    "width": 83,
    "height": 94,
    "fill": "#3B82F6",
    "stroke": "black"
  },
  {
    "kind": "rect",
    "x": 541.5,
    "y": 867.5,
    "width": 78,
    "height": 94,
    "fill": "#D9D9D9",
    "stroke": "black"
  },
  {
    "kind": "rect",
    "x": 704.5,
    "y": 868.5,
    "width": 53,
    "height": 42,
    "fill": "#D9D9D9",
    "stroke": "black"
  },
  {
    "kind": "rect",
    "x": 704.5,
    "y": 909.5,
    "width": 53,
    "height": 52,
    "fill": "#D9D9D9",
    "stroke": "black"
  },
  {
    "kind": "rect",
    "x": 662.25,
    "y": 965.25,
    "width": 0.5,
    "height": 220.5,
    "fill": "#3B82F6",
    "stroke": "none",
    "strokeWidth": 0.5
  },
  {
    "kind": "rect",
    "x": 853,
    "y": 659,
    "width": 17,
    "height": 1,
    "fill": "#D9D9D9"
  },
  {
    "kind": "rect",
    "x": 802.5,
    "y": 696.5,
    "width": 69,
    "height": 88,
    "fill": "#D9D9D9",
    "stroke": "black"
  },
  {
    "kind": "rect",
    "x": 801.5,
    "y": 646.5,
    "width": 69,
    "height": 50,
    "fill": "#D9D9D9",
    "stroke": "black"
  },
  {
    "kind": "rect",
    "x": 767.5,
    "y": 350.5,
    "width": 102,
    "height": 141,
    "fill": "#D9D9D9",
    "stroke": "black"
  },
  {
    "kind": "rect",
    "x": 767.5,
    "y": 0.5,
    "width": 104,
    "height": 109,
    "fill": "#D9D9D9",
    "stroke": "black"
  },
  {
    "kind": "rect",
    "x": 870.5,
    "y": 1.5,
    "width": 896,
    "height": 109,
    "fill": "#D9D9D9",
    "stroke": "black"
  },
  {
    "kind": "rect",
    "x": 872.5,
    "y": 0.5,
    "width": 110,
    "height": 109,
    "fill": "#D9D9D9",
    "stroke": "black"
  },
  {
    "kind": "rect",
    "x": 979.5,
    "y": 0.5,
    "width": 46,
    "height": 109,
    "fill": "#D9D9D9",
    "stroke": "black"
  },
  {
    "kind": "rect",
    "x": 1792.5,
    "y": 19.5,
    "width": 52,
    "height": 91,
    "fill": "#D9D9D9",
    "stroke": "black"
  },
  {
    "kind": "rect",
    "x": 1845.5,
    "y": 75.5,
    "width": 69,
    "height": 35,
    "fill": "#D9D9D9",
    "stroke": "black"
  },
  {
    "kind": "rect",
    "x": 1845.5,
    "y": 19.5,
    "width": 50,
    "height": 26,
    "fill": "#D9D9D9",
    "stroke": "black"
  },
  {
    "kind": "rect",
    "x": 272,
    "y": 776,
    "width": 37,
    "height": 21,
    "fill": "#D9D9D9"
  },
  {
    "kind": "rect",
    "x": 390,
    "y": 770,
    "width": 38,
    "height": 28,
    "fill": "#D9D9D9"
  },
  {
    "kind": "rect",
    "x": 819,
    "y": 786,
    "width": 23,
    "height": 33,
    "fill": "#D9D9D9"
  },
  {
    "kind": "rect",
    "x": 704,
    "y": 824,
    "width": 22,
    "height": 43,
    "fill": "#D9D9D9"
  },
  {
    "kind": "rect",
    "x": 748,
    "y": 841,
    "width": 15,
    "height": 19,
    "fill": "#D9D9D9"
  },
  {
    "kind": "rect",
    "x": 751,
    "y": 888,
    "width": 12,
    "height": 14,
    "fill": "#D9D9D9"
  },
  {
    "kind": "rect",
    "x": 748,
    "y": 946,
    "width": 15,
    "height": 10,
    "fill": "#D9D9D9"
  },
  {
    "kind": "rect",
    "x": 726,
    "y": 784,
    "width": 32,
    "height": 9,
    "fill": "#D9D9D9"
  },
  {
    "kind": "rect",
    "x": 721,
    "y": 819,
    "width": 35,
    "height": 24,
    "fill": "#D9D9D9"
  },
  {
    "kind": "rect",
    "x": 797,
    "y": 660,
    "width": 22,
    "height": 14,
    "fill": "#D9D9D9"
  },
  {
    "kind": "rect",
    "x": 858,
    "y": 652,
    "width": 14,
    "height": 16,
    "fill": "#D9D9D9"
  },
  {
    "kind": "rect",
    "x": 797,
    "y": 727,
    "width": 16,
    "height": 21,
    "fill": "#D9D9D9"
  },
  {
    "kind": "rect",
    "x": 778,
    "y": 632,
    "width": 15,
    "height": 28,
    "fill": "#D9D9D9"
  },
  {
    "kind": "rect",
    "x": 808,
    "y": 484,
    "width": 23,
    "height": 17,
    "fill": "#D9D9D9"
  },
  {
    "kind": "rect",
    "x": 1197,
    "y": 29,
    "width": 23,
    "height": 17,
    "fill": "#D9D9D9"
  },
  {
    "kind": "rect",
    "x": 805,
    "y": 340,
    "width": 26,
    "height": 18,
    "fill": "#D9D9D9"
  },
  {
    "kind": "rect",
    "x": 237,
    "y": 863,
    "width": 23,
    "height": 16,
    "fill": "#D9D9D9"
  },
  {
    "kind": "rect",
    "x": 191,
    "y": 863,
    "width": 23,
    "height": 16,
    "fill": "#D9D9D9"
  },
  {
    "kind": "rect",
    "x": 115,
    "y": 798,
    "width": 23,
    "height": 16,
    "fill": "#D9D9D9"
  },
  {
    "kind": "rect",
    "x": 367,
    "y": 745,
    "width": 23,
    "height": 16,
    "fill": "#D9D9D9"
  },
  {
    "kind": "rect",
    "x": 569,
    "y": 691,
    "width": 23,
    "height": 16,
    "fill": "#D9D9D9"
  },
  {
    "kind": "rect",
    "x": 644,
    "y": 802,
    "width": 23,
    "height": 16,
    "fill": "#D9D9D9"
  },
  {
    "kind": "rect",
    "x": 276,
    "y": 745,
    "width": 23,
    "height": 16,
    "fill": "#D9D9D9"
  },
  {
    "kind": "rect",
    "x": 276,
    "y": 745,
    "width": 20,
    "height": 16,
    "fill": "#D9D9D9"
  },
  {
    "kind": "rect",
    "x": 268,
    "y": 839,
    "width": 23,
    "height": 16,
    "fill": "#D9D9D9"
  },
  {
    "kind": "rect",
    "x": 424,
    "y": 774,
    "width": 23,
    "height": 16,
    "fill": "#D9D9D9"
  },
  {
    "kind": "rect",
    "x": 151,
    "y": 842,
    "width": 23,
    "height": 16,
    "fill": "#D9D9D9"
  },
  {
    "kind": "rect",
    "x": 800.5,
    "y": 679.5,
    "width": 41,
    "height": 15,
    "fill": "#D9D9D9",
    "stroke": "black"
  },
  {
    "kind": "rect",
    "x": 832.5,
    "y": 679.5,
    "width": 1,
    "height": 15,
    "fill": "#D9D9D9",
    "stroke": "black"
  },
  {
    "kind": "rect",
    "x": 826.5,
    "y": 679.5,
    "width": 1,
    "height": 15,
    "fill": "#D9D9D9",
    "stroke": "black"
  },
  {
    "kind": "rect",
    "x": 802.5,
    "y": 679.5,
    "width": 1,
    "height": 15,
    "fill": "#D9D9D9",
    "stroke": "black"
  },
  {
    "kind": "rect",
    "x": 805.5,
    "y": 679.5,
    "width": 1,
    "height": 15,
    "fill": "#D9D9D9",
    "stroke": "black"
  },
  {
    "kind": "rect",
    "x": 806.5,
    "y": 679.5,
    "width": 2,
    "height": 15,
    "fill": "#D9D9D9",
    "stroke": "black"
  },
  {
    "kind": "rect",
    "x": 813.5,
    "y": 679.5,
    "width": 1,
    "height": 15,
    "fill": "#D9D9D9",
    "stroke": "black"
  },
  {
    "kind": "rect",
    "x": 816.5,
    "y": 679.5,
    "width": 1,
    "height": 15,
    "fill": "#D9D9D9",
    "stroke": "black"
  },
  {
    "kind": "rect",
    "x": 819.5,
    "y": 679.5,
    "width": 2,
    "height": 15,
    "fill": "#D9D9D9",
    "stroke": "black"
  },
  {
    "kind": "rect",
    "x": 823.5,
    "y": 679.5,
    "width": 1,
    "height": 15,
    "fill": "#D9D9D9",
    "stroke": "black"
  },
  {
    "kind": "rect",
    "x": 829.5,
    "y": 679.5,
    "width": 1,
    "height": 15,
    "fill": "#D9D9D9",
    "stroke": "black"
  },
  {
    "kind": "rect",
    "x": 839.25,
    "y": 679.25,
    "width": 0.5,
    "height": 15.5,
    "fill": "#D9D9D9",
    "stroke": "black",
    "strokeWidth": 0.5
  },
  {
    "kind": "rect",
    "x": 836.5,
    "y": 679.5,
    "width": 1,
    "height": 15,
    "fill": "#D9D9D9",
    "stroke": "black"
  },
  {
    "kind": "rect",
    "x": 1704.5,
    "y": 92.5,
    "width": 41,
    "height": 15,
    "fill": "#D9D9D9",
    "stroke": "black"
  },
  {
    "kind": "rect",
    "x": 1736.5,
    "y": 92.5,
    "width": 1,
    "height": 15,
    "fill": "#D9D9D9",
    "stroke": "black"
  },
  {
    "kind": "rect",
    "x": 1730.5,
    "y": 92.5,
    "width": 1,
    "height": 15,
    "fill": "#D9D9D9",
    "stroke": "black"
  },
  {
    "kind": "rect",
    "x": 1706.5,
    "y": 92.5,
    "width": 1,
    "height": 15,
    "fill": "#D9D9D9",
    "stroke": "black"
  },
  {
    "kind": "rect",
    "x": 1709.5,
    "y": 92.5,
    "width": 1,
    "height": 15,
    "fill": "#D9D9D9",
    "stroke": "black"
  },
  {
    "kind": "rect",
    "x": 1710.5,
    "y": 92.5,
    "width": 2,
    "height": 15,
    "fill": "#D9D9D9",
    "stroke": "black"
  },
  {
    "kind": "rect",
    "x": 1717.5,
    "y": 92.5,
    "width": 1,
    "height": 15,
    "fill": "#D9D9D9",
    "stroke": "black"
  },
  {
    "kind": "rect",
    "x": 1720.5,
    "y": 92.5,
    "width": 1,
    "height": 15,
    "fill": "#D9D9D9",
    "stroke": "black"
  },
  {
    "kind": "rect",
    "x": 1723.5,
    "y": 92.5,
    "width": 2,
    "height": 15,
    "fill": "#D9D9D9",
    "stroke": "black"
  },
  {
    "kind": "rect",
    "x": 1727.5,
    "y": 92.5,
    "width": 1,
    "height": 15,
    "fill": "#D9D9D9",
    "stroke": "black"
  },
  {
    "kind": "rect",
    "x": 1733.5,
    "y": 92.5,
    "width": 1,
    "height": 15,
    "fill": "#D9D9D9",
    "stroke": "black"
  },
  {
    "kind": "rect",
    "x": 1743.25,
    "y": 92.25,
    "width": 0.5,
    "height": 15.5,
    "fill": "#D9D9D9",
    "stroke": "black",
    "strokeWidth": 0.5
  },
  {
    "kind": "rect",
    "x": 1740.5,
    "y": 92.5,
    "width": 1,
    "height": 15,
    "fill": "#D9D9D9",
    "stroke": "black"
  },
  {
    "kind": "rect",
    "x": 772,
    "y": 99,
    "width": 26,
    "height": 18,
    "fill": "#D9D9D9"
  },
  {
    "kind": "rect",
    "x": 832,
    "y": 93,
    "width": 26,
    "height": 18,
    "fill": "#D9D9D9"
  },
  {
    "kind": "rect",
    "x": 922,
    "y": 93,
    "width": 26,
    "height": 18,
    "fill": "#D9D9D9"
  },
  {
    "kind": "rect",
    "x": 987,
    "y": 93,
    "width": 26,
    "height": 18,
    "fill": "#D9D9D9"
  },
  {
    "kind": "rect",
    "x": 858,
    "y": 163,
    "width": 16,
    "height": 26,
    "fill": "#D9D9D9"
  },
  {
    "kind": "rect",
    "x": 1174,
    "y": 11,
    "width": 16,
    "height": 26,
    "fill": "#D9D9D9"
  },
  {
    "kind": "rect",
    "x": 1168,
    "y": 12,
    "width": 22,
    "height": 26,
    "fill": "#D9D9D9"
  },
  {
    "kind": "rect",
    "x": 1022,
    "y": 11,
    "width": 16,
    "height": 26,
    "fill": "#D9D9D9"
  },
  {
    "kind": "rect",
    "x": 1254.5,
    "y": 37.5,
    "width": 74,
    "height": 73,
    "fill": "#D9D9D9"
  },
  {
    "kind": "rect",
    "x": 1254.5,
    "y": 37.5,
    "width": 74,
    "height": 73,
    "stroke": "black"
  },
  {
    "kind": "rect",
    "x": 1254.5,
    "y": 37.5,
    "width": 74,
    "height": 73,
    "stroke": "black",
    "strokeOpacity": 0.2
  },
  {
    "kind": "rect",
    "x": 1179.5,
    "y": 38.5,
    "width": 74,
    "height": 73,
    "fill": "#D9D9D9"
  },
  {
    "kind": "rect",
    "x": 1179.5,
    "y": 38.5,
    "width": 74,
    "height": 73,
    "stroke": "black"
  },
  {
    "kind": "rect",
    "x": 1179.5,
    "y": 38.5,
    "width": 74,
    "height": 73,
    "stroke": "black",
    "strokeOpacity": 0.2
  },
  {
    "kind": "rect",
    "x": 1559.5,
    "y": 37.5,
    "width": 57,
    "height": 72,
    "fill": "#D9D9D9"
  },
  {
    "kind": "rect",
    "x": 1559.5,
    "y": 37.5,
    "width": 57,
    "height": 72,
    "stroke": "black"
  },
  {
    "kind": "rect",
    "x": 1559.5,
    "y": 37.5,
    "width": 57,
    "height": 72,
    "stroke": "black",
    "strokeOpacity": 0.2
  },
  {
    "kind": "rect",
    "x": 1325.5,
    "y": 37.5,
    "width": 233,
    "height": 73,
    "fill": "#D9D9D9",
    "stroke": "black"
  },
  {
    "kind": "rect",
    "x": 1691.5,
    "y": 1.5,
    "width": 75,
    "height": 44,
    "fill": "#D9D9D9",
    "stroke": "black"
  },
  {
    "kind": "rect",
    "x": 1204,
    "y": 28,
    "width": 26,
    "height": 18,
    "fill": "#D9D9D9"
  },
  {
    "kind": "rect",
    "x": 1279,
    "y": 99,
    "width": 26,
    "height": 18,
    "fill": "#D9D9D9"
  },
  {
    "kind": "rect",
    "x": 1435,
    "y": 18,
    "width": 26,
    "height": 37,
    "fill": "#D9D9D9"
  },
  {
    "kind": "rect",
    "x": 1574,
    "y": 18,
    "width": 26,
    "height": 37,
    "fill": "#D9D9D9"
  },
  {
    "kind": "rect",
    "x": 1574,
    "y": 18,
    "width": 26,
    "height": 37,
    "fill": "#D9D9D9"
  },
  {
    "kind": "rect",
    "x": 1684,
    "y": 10,
    "width": 22,
    "height": 26,
    "fill": "#D9D9D9"
  },
  {
    "kind": "rect",
    "x": 1026.5,
    "y": 38.5,
    "width": 152,
    "height": 73,
    "fill": "#D9D9D9",
    "stroke": "black"
  },
  {
    "kind": "rect",
    "x": 1084,
    "y": 33,
    "width": 26,
    "height": 18,
    "fill": "#D9D9D9"
  },
  {
    "kind": "rect",
    "x": 114,
    "y": 748,
    "width": 25,
    "height": 25,
    "fill": "#D9D9D9"
  },
  {
    "kind": "rect",
    "x": 390.5,
    "y": 867.5,
    "width": 469,
    "height": 318,
    "fill": "#D9D9D9",
    "stroke": "black",
    "areaId": "coffeeBar"
  },
  {
    "kind": "rect",
    "x": 662.5,
    "y": 867.5,
    "width": 197,
    "height": 318,
    "fill": "#D9D9D9",
    "stroke": "none"
  },
  {
    "kind": "rect",
    "x": 187.5,
    "y": 581.5,
    "width": 121,
    "height": 171,
    "fill": "#D9D9D9",
    "stroke": "black"
  },
  {
    "kind": "rect",
    "x": 767,
    "y": 272.5,
    "width": 104,
    "height": 512,
    "fill": "#D9D9D9",
    "stroke": "black"
  },
  {
    "kind": "polygon",
    "x": 301,
    "y": 969,
    "width": 50.766999999999996,
    "height": 49.049999999999955,
    "fill": "transparent",
    "stroke": null,
    "clipPath": "polygon(32.4364% 0.0000%, 100.0000% 62.3364%, 67.5636% 100.0000%, 0.0000% 37.6616%, 32.4364% 0.0000%)"
  },
  {
    "kind": "polygon",
    "x": 301,
    "y": 969,
    "width": 50.766999999999996,
    "height": 49.049999999999955,
    "fill": "#F5F5F5",
    "stroke": null,
    "clipPath": "polygon(32.4364% 0.0000%, 100.0000% 62.3364%, 67.5636% 100.0000%, 0.0000% 37.6616%, 32.4364% 0.0000%)"
  },
  {
    "kind": "polygon",
    "x": 187,
    "y": 968,
    "width": 57.462999999999994,
    "height": 56.22000000000003,
    "fill": "transparent",
    "stroke": null,
    "clipPath": "polygon(67.8906% 0.0000%, 100.0000% 35.0872%, 32.1111% 100.0000%, 0.0000% 64.9057%, 67.8906% 0.0000%)"
  },
  {
    "kind": "polygon",
    "x": 187,
    "y": 968,
    "width": 57.462999999999994,
    "height": 56.22000000000003,
    "fill": "#F5F5F5",
    "stroke": null,
    "clipPath": "polygon(67.8906% 0.0000%, 100.0000% 35.0872%, 32.1111% 100.0000%, 0.0000% 64.9057%, 67.8906% 0.0000%)"
  },
  {
    "kind": "polygon",
    "x": 5.00001,
    "y": 811,
    "width": 50.76699000000001,
    "height": 49.04899999999998,
    "fill": "transparent",
    "stroke": null,
    "clipPath": "polygon(32.4372% 0.0000%, 100.0000% 62.3377%, 67.5626% 100.0000%, 0.0000% 37.6623%, 32.4372% 0.0000%)"
  },
  {
    "kind": "polygon",
    "x": 5.00001,
    "y": 811,
    "width": 50.76699000000001,
    "height": 49.04899999999998,
    "fill": "#F5F5F5",
    "stroke": null,
    "clipPath": "polygon(32.4372% 0.0000%, 100.0000% 62.3377%, 67.5626% 100.0000%, 0.0000% 37.6623%, 32.4372% 0.0000%)"
  },
  {
    "kind": "rect",
    "x": 766.5,
    "y": 108.5,
    "width": 104,
    "height": 109,
    "fill": "#D9D9D9",
    "stroke": "black"
  },
  {
    "kind": "rect",
    "x": 1617.5,
    "y": 37.5,
    "width": 45,
    "height": 37,
    "fill": "#D9D9D9",
    "stroke": null
  },
  {
    "kind": "rect",
    "x": 1617.5,
    "y": 37.5,
    "width": 45,
    "height": 37,
    "fill": "transparent",
    "stroke": "black"
  },
  {
    "kind": "rect",
    "x": 1617.5,
    "y": 37.5,
    "width": 45,
    "height": 37,
    "fill": "transparent",
    "stroke": "black",
    "strokeOpacity": 0.2
  }
];
const OVERLAY_MARKUP = "<line x1=\"870.5\" y1=\"784\" x2=\"870.5\" y2=\"854\" stroke=\"black\"/>\n\n\n\n\n\n\n<mask id=\"path-12-inside-1_0_1\" fill=\"white\">\n\n\n\n\n<mask id=\"path-29-inside-5_0_1\" fill=\"white\">\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n<path d=\"M406.972 906.273V915H405.915V907.381H405.864L403.733 908.795V907.722L405.915 906.273H406.972ZM409.277 913.21V912.341L413.112 906.273H413.743V907.619H413.317L410.419 912.205V912.273H415.584V913.21H409.277ZM413.385 915V912.946V912.541V906.273H414.391V915H413.385Z\" fill=\"black\"/>\n\n<path d=\"M611.972 761.273V770H610.915V762.381H610.864L608.733 763.795V762.722L610.915 761.273H611.972ZM614.754 770L618.658 762.278V762.21H614.158V761.273H619.749V762.261L615.862 770H614.754Z\" fill=\"black\"/>\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n<mask id=\"path-89-inside-7_0_1\" fill=\"white\">\n\n\n\n<mask id=\"path-95-inside-8_0_1\" fill=\"white\">\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n<path d=\"M777.972 1056.27V1065H776.915V1057.38H776.864L774.733 1058.8V1057.72L776.915 1056.27H777.972Z\" fill=\"black\"/>\n\n<path d=\"M734.699 897.21V896.341L738.534 890.273H739.165V891.619H738.739L735.841 896.205V896.273H741.006V897.21H734.699ZM738.807 899V896.946V896.541V890.273H739.812V899H738.807Z\" fill=\"black\"/>\n\n\n<path d=\"M845.176 673L849.08 665.278V665.21H844.58V664.273H850.17V665.261L846.284 673H845.176Z\" fill=\"black\"/>\n\n\n\n<path d=\"M649.972 902.273V911H648.915V903.381H648.864L646.733 904.795V903.722L648.915 902.273H649.972ZM655.55 902.273V911H654.493V903.381H654.442L652.311 904.795V903.722L654.493 902.273H655.55Z\" fill=\"black\"/>\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n<path d=\"M1405.7 99.2102V98.3409L1409.53 92.2727H1410.16V93.6193H1409.74L1406.84 98.2045V98.2727H1412.01V99.2102H1405.7ZM1409.81 101V98.946V98.5412V92.2727H1410.81V101H1409.81ZM1416.55 92.2727V101H1415.5V93.3807H1415.45L1413.31 94.7955V93.7216L1415.5 92.2727H1416.55Z\" fill=\"black\"/>\n<path d=\"M1730.7 39.2102V38.3409L1734.53 32.2727H1735.16V33.6193H1734.74L1731.84 38.2045V38.2727H1737.01V39.2102H1730.7ZM1734.81 41V38.946V38.5412V32.2727H1735.81V41H1734.81ZM1738.4 39.2102V38.3409L1742.23 32.2727H1742.86V33.6193H1742.44L1739.54 38.2045V38.2727H1744.7V39.2102H1738.4ZM1742.51 41V38.946V38.5412V32.2727H1743.51V41H1742.51Z\" fill=\"black\"/>\n\n\n\n\n\n<defs>\n<filter id=\"filter0_i_0_1\" x=\"390\" y=\"786\" width=\"45\" height=\"52\" filterUnits=\"userSpaceOnUse\" color-interpolation-filters=\"sRGB\">\n<feFlood flood-opacity=\"0\" result=\"BackgroundImageFix\"/>\n<feBlend mode=\"normal\" in=\"SourceGraphic\" in2=\"BackgroundImageFix\" result=\"shape\"/>\n<feColorMatrix in=\"SourceAlpha\" type=\"matrix\" values=\"0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0\" result=\"hardAlpha\"/>\n<feOffset dy=\"4\"/>\n<feGaussianBlur stdDeviation=\"2\"/>\n<feComposite in2=\"hardAlpha\" operator=\"arithmetic\" k2=\"-1\" k3=\"1\"/>\n<feColorMatrix type=\"matrix\" values=\"0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0\"/>\n<feBlend mode=\"normal\" in2=\"shape\" result=\"effect1_innerShadow_0_1\"/>\n</filter>\n</defs>";

function ShapeBlock({ shape }) {
  const border = shape.stroke
    ? `${shape.strokeWidth ?? 1}px solid ${shape.stroke}`
    : 'none';

  const style = {
    position: 'absolute',
    left: s(shape.x),
    top: s(shape.y),
    width: s(shape.width),
    height: s(shape.height),
    background: shape.fill ?? 'transparent',
    border,
    opacity: shape.strokeOpacity ?? 1,
    boxSizing: 'border-box',
  };

  if (shape.clipPath) {
    style.clipPath = shape.clipPath;
  }

  if (shape.transform?.type === 'rotate') {
    style.transform = `rotate(${shape.transform.angle}deg)`;
    style.transformOrigin = 'top left';
  }

  return <div style={style} />;
}

const buttonStyle = {
  border: '1px solid #d1d5db',
  background: '#fff',
  borderRadius: 8,
  padding: '6px 10px',
  fontSize: 12,
  fontWeight: 600,
  color: '#374151',
  cursor: 'pointer',
};

export default function MainhouseFloorPlanForMerge() {
  const wrapperRef = useRef(null);
  const canvasWidth = s(SOURCE_WIDTH);
  const canvasHeight = s(SOURCE_HEIGHT);
  const stagePaddingX = 40;
  const stagePaddingY = 56;
  const [fitScale, setFitScale] = useState(1);
  const [zoom, setZoom] = useState(1);
  const indexedShapes = SHAPES.map((shape, index) => ({ ...shape, index }));
  const fillShapes = indexedShapes
    .filter((shape) => shape.fill && shape.fill !== 'transparent')
    .sort((left, right) => {
      const areaDifference = (right.width * right.height) - (left.width * left.height);
      return areaDifference !== 0 ? areaDifference : left.index - right.index;
    });
  const outlineShapes = indexedShapes.filter((shape) => !shape.fill || shape.fill === 'transparent');

  useEffect(() => {
    const updateScale = () => {
      if (!wrapperRef.current) {
        return;
      }
      const availableWidth = wrapperRef.current.clientWidth - 48 - (stagePaddingX * 2);
      if (availableWidth <= 0) {
        return;
      }
      setFitScale(Math.min(1, availableWidth / canvasWidth));
    };

    updateScale();
    const resizeObserver = new ResizeObserver(updateScale);
    resizeObserver.observe(wrapperRef.current);
    window.addEventListener('resize', updateScale);
    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', updateScale);
    };
  }, [canvasWidth]);

  const effectiveScale = fitScale * zoom;
  const zoomPercent = Math.round(zoom * 100);
  const stageWidth = Math.round((canvasWidth * effectiveScale) + (stagePaddingX * 2));
  const stageHeight = Math.round((canvasHeight * effectiveScale) + (stagePaddingY * 2));

  return (
    <div
      ref={wrapperRef}
      style={{
        overflowX: 'auto',
        overflowY: 'auto',
        background: '#ffffff',
        border: '1px solid #e5e7eb',
        borderRadius: 16,
        padding: 24,
        boxShadow: '0 1px 3px rgba(15,23,42,0.08)',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          gap: 12,
          fontFamily: 'Arial, sans-serif',
          fontSize: 13,
          color: '#111827',
          marginBottom: 12,
          fontWeight: 600,
          flexWrap: 'wrap',
        }}
      >
        <div>
          Drugs Unit Map
          <span style={{ fontSize: 10, fontWeight: 400, color: '#6b7280', marginLeft: 14 }}>
            Built from MainFloorPlanOnly.svg at detox scale
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button type="button" onClick={() => setZoom((current) => Math.max(0.6, current - 0.1))} style={buttonStyle}>Zoom Out</button>
          <div style={{ minWidth: 46, textAlign: 'center', fontSize: 12, color: '#4b5563' }}>{zoomPercent}%</div>
          <button type="button" onClick={() => setZoom((current) => Math.min(1.8, current + 0.1))} style={buttonStyle}>Zoom In</button>
          <button type="button" onClick={() => setZoom(1)} style={buttonStyle}>100%</button>
        </div>
      </div>

      <div
        style={{
          width: Math.max(stageWidth, canvasWidth + (stagePaddingX * 2)),
          padding: 0,
          boxSizing: 'border-box',
        }}
      >
        <div
          style={{
            position: 'relative',
            width: stageWidth,
            height: stageHeight,
            margin: '0 auto',
            flex: '0 0 auto',
            background: '#F5F5F5',
            boxShadow: '0 4px 24px rgba(0,0,0,0.2)',
            borderRadius: 12,
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              position: 'absolute',
              left: '50%',
              top: stagePaddingY,
              width: canvasWidth,
              height: canvasHeight,
              transform: `translateX(-50%) scale(${effectiveScale})`,
              transformOrigin: 'top center',
            }}
          >
            {fillShapes.map((shape) => <ShapeBlock key={`fill-${shape.index}`} shape={shape} />)}
            {outlineShapes.map((shape) => <ShapeBlock key={`outline-${shape.index}`} shape={shape} />)}
            <svg
              viewBox={VIEW_BOX}
              width={canvasWidth}
              height={canvasHeight}
              style={{ position: 'absolute', inset: 0, overflow: 'visible' }}
              dangerouslySetInnerHTML={{ __html: OVERLAY_MARKUP }}
            />
            <div
              style={{
                position: 'absolute',
                left: s(390.5),
                top: s(823.5),
                width: s(367.5),
                height: s(43),
                background: '#FDE68A',
                zIndex: 4,
              }}
            />
            <div
              style={{
                position: 'absolute',
                left: s(715.5),
                top: s(823.5),
                width: s(42.5),
                height: s(43),
                background: '#FDE68A',
                zIndex: 5,
              }}
            />
            <div
              style={{
                position: 'absolute',
                left: s(716.5),
                top: s(821.5),
                width: s(42.5),
                height: s(3),
                background: '#FDE68A',
                zIndex: 6,
              }}
            />
            <div
              style={{
                position: 'absolute',
                left: s(757),
                top: s(823.5),
                width: s(3),
                height: s(18.5),
                background: '#FDE68A',
                zIndex: 6,
              }}
            />
            <div
              style={{
                position: 'absolute',
                left: s(724.5),
                top: s(784.5),
                width: s(20),
                height: s(3),
                background: '#FDE68A',
                zIndex: 6,
              }}
            />
            <div
              style={{
                position: 'absolute',
                left: s(758),
                top: s(784.5),
                width: s(111.5),
                height: s(39),
                background: '#FDE68A',
                zIndex: 7,
              }}
            />
            <div
              style={{
                position: 'absolute',
                left: s(724.5),
                top: s(784.5),
                width: s(3),
                height: s(8),
                background: '#111',
                zIndex: 6,
              }}
            />
            <div
              style={{
                position: 'absolute',
                left: s(741.5),
                top: s(784.5),
                width: s(3),
                height: s(8),
                background: '#111',
                zIndex: 6,
              }}
            />
            <div
              style={{
                position: 'absolute',
                left: s(715.5),
                top: s(866.5),
                width: s(42.5),
                height: s(98.75),
                background: '#D9D9D9',
              }}
            />
            <div
              style={{
                position: 'absolute',
                left: s(715.5),
                top: s(867.5),
                width: s(42.5),
                height: s(1),
                background: '#111',
                zIndex: 8,
              }}
            />
            <div
              style={{
                position: 'absolute',
                left: s(715.5),
                top: s(963.5),
                width: s(42.5),
                height: s(3),
                background: '#D9D9D9',
                zIndex: 4,
              }}
            />
            <div
              style={{
                position: 'absolute',
                left: s(715.5),
                top: s(822.5),
                width: s(120),
                height: s(2),
                background: '#FDE68A',
                zIndex: 7,
              }}
            />
            <div
              style={{
                position: 'absolute',
                left: s(868.5),
                top: s(794),
                width: s(3),
                height: s(20),
                background: '#EF4444',
                zIndex: 8,
              }}
            />
            <div
              style={{
                position: 'absolute',
                left: s(866.5),
                top: s(791),
                width: s(8),
                height: s(3),
                background: '#EF4444',
                zIndex: 8,
              }}
            />
            <div
              style={{
                position: 'absolute',
                left: s(866.5),
                top: s(814),
                width: s(8),
                height: s(3),
                background: '#EF4444',
                zIndex: 8,
              }}
            />
            <div
              style={{
                position: 'absolute',
                left: s(758),
                top: s(823.5),
                width: s(1),
                height: s(18.5),
                background: '#111',
                zIndex: 4,
              }}
            />
            <div
              style={{
                position: 'absolute',
                left: s(758),
                top: s(862),
                width: s(1),
                height: s(103.25),
                background: '#111',
                zIndex: 4,
              }}
            />
            <div
              style={{
                position: 'absolute',
                left: s(757),
                top: s(842),
                width: s(3),
                height: s(20),
                background: '#FDE68A',
                zIndex: 5,
              }}
            />
            <div
              style={{
                position: 'absolute',
                left: s(755),
                top: s(839),
                width: s(8),
                height: s(3),
                background: '#111',
                zIndex: 5,
              }}
            />
            <div
              style={{
                position: 'absolute',
                left: s(755),
                top: s(862),
                width: s(8),
                height: s(3),
                background: '#111',
                zIndex: 5,
              }}
            />
            <div
              style={{
                position: 'absolute',
                left: s(662.25),
                top: s(965.25),
                width: s(1),
                height: s(152.75),
                background: '#111',
                zIndex: 4,
              }}
            />
            <div
              style={{
                position: 'absolute',
                left: s(662.25),
                top: s(1138),
                width: s(1),
                height: s(47.75),
                background: '#111',
                zIndex: 4,
              }}
            />
            <div
              style={{
                position: 'absolute',
                left: s(661),
                top: s(1118),
                width: s(3),
                height: s(20),
                background: '#D9D9D9',
                zIndex: 5,
              }}
            />
            <div
              style={{
                position: 'absolute',
                left: s(659),
                top: s(1115),
                width: s(8),
                height: s(3),
                background: '#111',
                zIndex: 5,
              }}
            />
            <div
              style={{
                position: 'absolute',
                left: s(659),
                top: s(1138),
                width: s(8),
                height: s(3),
                background: '#111',
                zIndex: 5,
              }}
            />
            <div
              style={{
                position: 'absolute',
                left: s(758),
                top: s(823.5),
                width: s(76),
                height: s(141.75),
                background: '#D9D9D9',
              }}
            />
            <div
              style={{
                position: 'absolute',
                left: s(758),
                top: s(823.5),
                width: s(77.5),
                height: s(3),
                background: '#FDE68A',
                zIndex: 6,
              }}
            />
            <div
              style={{
                position: 'absolute',
                left: s(390.5),
                top: s(867.5),
                width: s(8.5),
                height: s(1),
                background: '#111',
                pointerEvents: 'none',
                zIndex: 5,
              }}
            />
            <div
              style={{
                position: 'absolute',
                left: s(419),
                top: s(867.5),
                width: s(8.5),
                height: s(1),
                background: '#111',
                pointerEvents: 'none',
                zIndex: 5,
              }}
            />
            <div
              style={{
                position: 'absolute',
                left: s(390.5),
                top: s(867.5),
                width: s(1),
                height: s(95),
                background: '#111',
                pointerEvents: 'none',
                zIndex: 5,
              }}
            />
            <div
              style={{
                position: 'absolute',
                left: s(426.5),
                top: s(867.5),
                width: s(1),
                height: s(95),
                background: '#111',
                pointerEvents: 'none',
                zIndex: 5,
              }}
            />
            <div
              style={{
                position: 'absolute',
                left: s(390.5),
                top: s(961.5),
                width: s(37),
                height: s(1),
                background: '#111',
                pointerEvents: 'none',
                zIndex: 5,
              }}
            />
            <div
              style={{
                position: 'absolute',
                left: s(427),
                top: s(866.5),
                width: s(331),
                height: s(4),
                background: '#D9D9D9',
                pointerEvents: 'none',
                zIndex: 4,
              }}
            />
            <div
              style={{
                position: 'absolute',
                left: s(651.5),
                top: s(867.5),
                width: s(20),
                height: s(2),
                background: '#D9D9D9',
                pointerEvents: 'none',
                zIndex: 5,
              }}
            />
            <div
              style={{
                position: 'absolute',
                left: s(619.5),
                top: s(867.5),
                width: s(2),
                height: s(94),
                background: '#D9D9D9',
                pointerEvents: 'none',
                zIndex: 4,
              }}
            />
            <div
              style={{
                position: 'absolute',
                left: s(620.5),
                top: s(867.5),
                width: s(1),
                height: s(94),
                background: '#111',
                pointerEvents: 'none',
                zIndex: 5,
              }}
            />
            <div
              style={{
                position: 'absolute',
                left: s(702.5),
                top: s(867.5),
                width: s(2),
                height: s(94),
                background: '#D9D9D9',
                pointerEvents: 'none',
                zIndex: 4,
              }}
            />
            <div
              style={{
                position: 'absolute',
                left: s(703.5),
                top: s(867.5),
                width: s(1),
                height: s(94),
                background: '#111',
                pointerEvents: 'none',
                zIndex: 5,
              }}
            />
            <div
              style={{
                position: 'absolute',
                left: s(651.5),
                top: s(867.5),
                width: s(20),
                height: s(2),
                background: '#D9D9D9',
                pointerEvents: 'none',
                zIndex: 5,
              }}
            />
            <div
              style={{
                position: 'absolute',
                left: s(648.5),
                top: s(865.5),
                width: s(3),
                height: s(5),
                background: '#111',
                pointerEvents: 'none',
                zIndex: 5,
              }}
            />
            <div
              style={{
                position: 'absolute',
                left: s(671.5),
                top: s(865.5),
                width: s(3),
                height: s(5),
                background: '#111',
                pointerEvents: 'none',
                zIndex: 5,
              }}
            />
            <div
              style={{
                position: 'absolute',
                left: s(399),
                top: s(867.5),
                width: s(20),
                height: s(2),
                background: '#D9D9D9',
                pointerEvents: 'none',
                zIndex: 5,
              }}
            />
            <div
              style={{
                position: 'absolute',
                left: s(396),
                top: s(865.5),
                width: s(3),
                height: s(5),
                background: '#111',
                pointerEvents: 'none',
                zIndex: 5,
              }}
            />
            <div
              style={{
                position: 'absolute',
                left: s(419),
                top: s(865.5),
                width: s(3),
                height: s(5),
                background: '#111',
                pointerEvents: 'none',
                zIndex: 5,
              }}
            />
            <div
              style={{
                position: 'absolute',
                left: s(704.5),
                top: s(868.5),
                width: s(52),
                height: s(1),
                background: '#111',
                pointerEvents: 'none',
                zIndex: 4,
              }}
            />
            <div
              style={{
                position: 'absolute',
                left: s(704.5),
                top: s(868.5),
                width: s(1),
                height: s(42),
                background: '#111',
                pointerEvents: 'none',
                zIndex: 4,
              }}
            />
            <div
              style={{
                position: 'absolute',
                left: s(704.5),
                top: s(909.5),
                width: s(52),
                height: s(1),
                background: '#111',
                pointerEvents: 'none',
                zIndex: 4,
              }}
            />
            <div
              style={{
                position: 'absolute',
                left: s(756),
                top: s(879.5),
                width: s(3),
                height: s(20),
                background: '#D9D9D9',
                pointerEvents: 'none',
                zIndex: 5,
              }}
            />
            <div
              style={{
                position: 'absolute',
                left: s(754),
                top: s(876.5),
                width: s(8),
                height: s(3),
                background: '#111',
                pointerEvents: 'none',
                zIndex: 5,
              }}
            />
            <div
              style={{
                position: 'absolute',
                left: s(754),
                top: s(899.5),
                width: s(8),
                height: s(3),
                background: '#111',
                pointerEvents: 'none',
                zIndex: 5,
              }}
            />
            <div
              style={{
                position: 'absolute',
                left: s(704.5),
                top: s(909.5),
                width: s(52),
                height: s(1),
                background: '#111',
                pointerEvents: 'none',
                zIndex: 4,
              }}
            />
            <div
              style={{
                position: 'absolute',
                left: s(704.5),
                top: s(909.5),
                width: s(1),
                height: s(52),
                background: '#111',
                pointerEvents: 'none',
                zIndex: 4,
              }}
            />
            <div
              style={{
                position: 'absolute',
                left: s(704.5),
                top: s(960.5),
                width: s(52),
                height: s(1),
                background: '#111',
                pointerEvents: 'none',
                zIndex: 4,
              }}
            />
            <div
              style={{
                position: 'absolute',
                left: s(756),
                top: s(925.5),
                width: s(3),
                height: s(20),
                background: '#D9D9D9',
                pointerEvents: 'none',
                zIndex: 5,
              }}
            />
            <div
              style={{
                position: 'absolute',
                left: s(754),
                top: s(922.5),
                width: s(8),
                height: s(3),
                background: '#111',
                pointerEvents: 'none',
                zIndex: 5,
              }}
            />
            <div
              style={{
                position: 'absolute',
                left: s(754),
                top: s(945.5),
                width: s(8),
                height: s(3),
                background: '#111',
                pointerEvents: 'none',
                zIndex: 5,
              }}
            />
            <div
              style={{
                position: 'absolute',
                left: s(758),
                top: s(823.5),
                width: s(76),
                height: s(1),
                background: '#EF4444',
                pointerEvents: 'none',
                zIndex: 9,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
