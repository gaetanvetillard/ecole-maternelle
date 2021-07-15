import React from 'react';
import {PDFDownloadLink, Page, View, Text, Document, Font, Image } from '@react-pdf/renderer'
import {styles} from '../Styles/PDFStyles';
import { LoadingItem } from './Loading';
import font from '../Fonts/Pattaya-Regular.ttf'


Font.register({ 
    family: "Pattaya",
    format: "truetype",
    src: font
  });


const PDFDoc = (props) => {
  
  const todayDate = new Date().toLocaleDateString("fr-FR", { day: '2-digit', month: 'long', year: "numeric" });
  const data = props.data
  const fileName = `${props.data.name} ${props.data.firstname} - Cahier de progrès du ${todayDate}`
  
  var rows = 0;
  var break_need = false;

  var skills_ = []

  for (let skill_ of data.skills) {
    let subskills = []
    for (let subskill_ of skill_.subskills) {
      let subskill_validated = false
      for (let item_ of subskill_.items) {
        if (item_.validation) {
          subskill_validated = true
        }
      };

      if (subskill_validated) {
        subskills.push(subskill_)
      }
    };

    if (subskills.length > 0) {
      skill_.subskills = subskills
      skills_.push(skill_)
    }
  }




  return (
    <Document fileName={fileName}>
      <Page orientation="landscape" style={styles.page} size="A4">
        <View style={styles.firstPage}>
          <View style={styles.header}>
            <View>
              <Text style={{fontFamily: "Pattaya"}}>Prénom : {data.firstname}</Text>
              <Text style={{fontFamily: "Pattaya"}}>Nom : {data.name}</Text>
            </View>
            <View>
              <Text>{data.school.name}</Text>
              <Text>{data.school.address}</Text>
              <Text>{data.school.zipcode} {data.school.city}</Text>
            </View>
          </View>
          <View style={styles.firstPageCenter}>
            <Text style={{fontFamily: "Pattaya"}}>Cahier de réussites</Text>
            <Text style={{fontFamily: "Pattaya"}}>et de progrès en maternelle</Text>
          </View>
        </View>


        {/* <View style={styles.secondPage} break>
          <Text style={styles.secondPageText}>
            Chers parents, ce cahier a été réalisé par l'équipe enseignante en cohérence avec les nouveaux programmes 2015
          </Text>
          <Text style={styles.secondPageText}>
            Ce cahier va vous permettre de suivre l'évolution de votre enfant de la toute petite section à la grande section de maternelle.
            Dans ce cahier vous trouverez des vignettes correspondant aux principales compétences à acquérir. Celles-ci ne sont pas systématiquement travaillées sur les quatre niveaux, donc toutes les vignettes ne seront pas remplies sur une année mais durant toute la maternelle.
          </Text>
          <Text style={styles.secondPageText}>
            Au fur et à mesure des apprentissages, dès que la compétence est acquise, les vignettes seront tamponnées au rythme de chaque enfant.
          </Text>
          <Text style={styles.secondPageText}>
            L'objectif étant que l'ensemble du cahier soit rempli en fin de grande section et que l'accent soit toujours mis sur les progrès déjà accomplis afin d'encourager l'enfant.
            Il est préférable de regarder ce cahier avec votre enfant et de le commenter ensemble. Il sera fier de vous montrer ses progrès !
          </Text>
          <Text style={styles.secondPageText}>
            Merci d'en prendre soin et de le rapporter dès que possible à l'école.
            N'oubliez pas de le signer à la fin.
          </Text>
          <Text style={styles.secondPageText}>
            Pour plus d'informations n'hésitez pas à nous contacter.
          </Text>
          <Text style={styles.secondPageText}>
            Cordialement,
          </Text>
          <Text style={styles.secondPageText}>
            Les enseignantes.
          </Text>
        </View> */}


        <View break>
          {skills_ && skills_.map((skill, index) => {
            if (rows % 2 === 0 && rows > 0) {
              break_need = true
            } else {
              break_need = false
            }

            return (
              <View key={index} style={styles.skillDiv} break={break_need}>
                <Text style={styles.skillTitle}>{skill.name}</Text>
                {skill.subskills && skill.subskills.map((subskill, index) => {
                  rows++;
                  var items_count = 0
                  return (
                    <View key={index} style={styles.subskillDiv} wrap={false}>
                      <Text style={styles.subskillTitle}>{subskill.name}</Text>
                      <View style={styles.imageList}>
                        {subskill.items && subskill.items.map((item, index) => {
                          if (items_count > 7) {
                            rows++;
                            items_count=1
                          };
                          if (item.validation) {
                            items_count++;
                            return (
                              <View key={index} style={{display: "flex", flexDirection: "column", textAlign: "center", marginRight: 10}}>
                                <View style={styles.itemDiv}>
                                  <Text style={styles.itemTitle}>{subskill.name} ({index+1})</Text>
                                  {item.type === "simple" &&
                                    <Image src={item.image_url} style={styles.itemImage} />
                                  }
                                  {item.type === "complex" &&
                                    <View style={styles.subitemDiv}>
                                      {item.subitems.length > 0 && item.subitems.map((subitem, index) => {
                                        if (subitem.validation && item.validation && item.validation.status !== 1) {
                                          return <Text key={index} style={styles.subitemText}>{subitem.content}</Text>
                                        } else if (subitem.validation && item.validation.status === 1) {
                                          return <Text key={index} style={styles.subitemText}>{subitem.content}</Text>
                                        } else {
                                          return null
                                        }
                                        
                                      })}
                                    </View>  
                                  }
                                  <Text style={styles.itemLabel}>{item.label}</Text>
                                </View>
                                {item.validation && item.validation.date && <Text style={[styles.validatedText, {backgroundColor: "black", color: "#ffb535"}]}>{item.validation.date}</Text>}
                                {item.validation && item.validation.status === 0 && <Text style={[styles.validatedText]}>En cours de validation</Text>}
                            </View>
                            )
                          } else {
                            return null
                          }
                        })}
                      </View>
                    </View>
                  )
                })}
              </View>
            )
          })}
        </View>




        <Text style={styles.footer} render={({ pageNumber, totalPages }) => (
          `${pageNumber} / ${totalPages}`
        )} fixed />
        <Text style={[styles.footer, {textAlign: "right"}]} fixed>{fileName}</Text>
      </Page>
    </Document>
  )
}



const PDF = props => {
  const todayDate = new Date().toLocaleDateString("fr-FR", { day: '2-digit', month: 'long', year: "numeric" });
  return (
    <>
      <PDFDownloadLink document={<PDFDoc {...props} />} fileName={`${props.data.name} ${props.data.firstname} - Cahier de progrès du ${todayDate}`}>
        {({ blob, url, loading, error }) => {
          if (loading) {
            if (error) {
              return <span>Erreur</span>
            }
            return <LoadingItem />
          } else {
            return <span onClick={() => setTimeout(props.closePage, 100)}>Télécharger le fichier PDF</span>
          }
        }}
      </PDFDownloadLink>
    </>
  )

}






export default PDF;