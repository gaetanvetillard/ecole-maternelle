import { StyleSheet } from '@react-pdf/renderer';

export const styles = StyleSheet.create({
  page: { padding: 20, paddingBottom: 35 },
  
  firstPage: {
    display: "flex",
  },

  firstPageCenter: {
    textAlign: "center",
    marginTop: 100,
    fontSize: "50pt"
  },

  header: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
  },

  secondPage: {
    textAlign: "center"
  },

  secondPageText: {
    marginTop: "0.8cm"
  },

  skillDiv: {
    textAlign: "left",
  },

  skillTitle: {
    textAlign: "left",
    fontSize: "30pt",
    fontWeight: "bold",
    textDecoration: "underline",
    marginBottom: 0,
    fontFamily: "Pattaya"
  },

  subskillDiv: {
    marginBottom: 3
  },

  subskillTitle: {
    fontSize: "22pt",
    paddingLeft: "5px",
    fontFamily: "Pattaya",
    textDecoration: "underline",
  },

  itemDiv: {
    display: "flex",
    justifyContent: "center",
    alignItems: 'center',
    border: "2px solid #ffb535",
    borderRadius: 10,
    flexDirection: "column",
    height: 160,
    width: 110,
    textAlign: "center",
    position: 'relative',
  },


  imageList: {
    display: "flex", 
    flexDirection: "row", 
    flexWrap: "wrap"
  },

  itemImage: {
    position: "absolute",
    width: 100,
    height: 100,
  },

  itemTitle: {
    fontSize: 11,
    position: "absolute",
    top: 0,
    backgroundColor: "#ffb535",
    padding: 3,
    width: "100%",
    textAlign: "center",
    border: "3px solid #ffb535",
    borderTopLeftRadius: 5,
    borderTopRightRadius: 5,
    borderBottom: "none",
  },

  itemLabel: {
    fontSize: 10,
    position: 'absolute',
    bottom: 2,
    textAlign: "center",
    width: '100%',
  },

  subitemDiv: {
    display: "flex", 
    flexDirection: "row", 
    flexWrap: "wrap", 
    position: "absolute", 
    top: 25, 
    width: "100%", 
    left: -45,
    textAlign: "center",
    alignItems: "center",
    justifyContent: "center"
  },

  subitemText: {
    fontSize: 10,
    padding: 3
  },


  validatedText: {
    backgroundColor: "#ffb535",
    fontSize: 9,
    width: "108px",
    height: 15,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: "3px",
    borderRadius: "10px",
    marginVertical: "5px",
  },


  footer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    textAlign: 'left',
    fontSize: "9pt"
  }, title: {
    textAlign: 'center',
    fontSize: "24pt"
  }, subtitle: {
    textAlign: "center",
    fontSize: "20pt"
  }
});