/**
 * SessionController
 *
 * @description :: Server-side logic for managing sessions
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
var bcrypt = require('bcrypt');
var nodemailer = require('nodemailer');
module.exports = {
	register : function(req,res,next){
        if(req.session.authenticated) return res.redirect('/');
        University.find(function(err,universities){
            return res.view({
                universities : universities
            });
        });
    },
    login : function(req,res,next){
        if(req.session.authenticated) return res.redirect('/');
        var not_confirm = false;
        if(req.session.notConfirm) {
            req.session.destroy();
            not_confirm = true;
        }
        return res.view({
            not_confirm:not_confirm
        });
    },
    'regis_user' : function(req,res,next){
        if(req.session.authenticated) return res.redirect('/');
        if(req.param('email').trim()=="" || req.param('name').trim()=="" || req.param('password').trim()=="" || req.param('confirmationpassword').trim()==""){
            var requireLoginError = ['Please fill the form completely.'];
            req.session.flash = {
                    err: requireLoginError
            }
            return res.redirect('/register');
        }
        var isEmail = false;
        var tmp_mail = req.param('email');
        for(var i=0;i<tmp_mail.length;i++){
            if(tmp_mail[i]=='@'){
                isEmail = true;
                break;
            }
        }
        if(!isEmail) {
            var requireLoginError = ['The email you requested is not valid. Please try again.'];
            req.session.flash = {
                    err: requireLoginError
            }
            return res.redirect('/register');
        }
        var domain_blacklist = ["0-mail.com", "0815.ru", "0815.su", "0clickemail.com", "0wnd.net", "0wnd.org", "10mail.org", "10minutemail.cf", "10minutemail.com", "10minutemail.de", "10minutemail.ga", "10minutemail.gq", "10minutemail.ml", "123-m.com", "12minutemail.com", "1ce.us", "1chuan.com", "1mail.ml", "1pad.de", "1zhuan.com", "20mail.in", "20mail.it", "20minutemail.com", "21cn.com", "24hourmail.com", "2prong.com", "30minutemail.com", "33mail.com", "3d-painting.com", "3mail.ga", "4mail.cf", "4mail.ga", "4warding.com", "4warding.net", "4warding.org", "5mail.cf", "5mail.ga", "60minutemail.com", "675hosting.com", "675hosting.net", "675hosting.org", "6ip.us", "6mail.cf", "6mail.ga", "6mail.ml", "6paq.com", "6url.com", "75hosting.com", "75hosting.net", "75hosting.org", "7days-printing.com", "7mail.ga", "7mail.ml", "7tags.com", "8mail.cf", "8mail.ga", "8mail.ml", "99experts.com", "9mail.cf", "9ox.net", "a-bc.net", "a45.in", "abusemail.de", "abyssmail.com", "ac20mail.in", "acentri.com", "advantimo.com", "afrobacon.com", "ag.us.to", "agedmail.com", "ahk.jp", "ajaxapp.net", "alivance.com", "amail.com", "amilegit.com", "amiri.net", "amiriindustries.com", "anappthat.com", "ano-mail.net", "anonbox.net", "anonymail.dk", "anonymbox.com", "antichef.com", "antichef.net", "antispam.de", "appixie.com", "armyspy.com", "aver.com", "azmeil.tk", "baxomale.ht.cx", "beddly.com", "beefmilk.com", "big1.us", "bigprofessor.so", "bigstring.com", "binkmail.com", "bio-muesli.net", "bladesmail.net", "blogmyway.org", "bobmail.info", "bodhi.lawlita.com", "bofthew.com", "bootybay.de", "boun.cr", "bouncr.com", "boxformail.in", "boxtemp.com.br", "brefmail.com", "brennendesreich.de", "broadbandninja.com", "bsnow.net", "bu.mintemail.com", "buffemail.com", "bugmenot.com", "bumpymail.com", "bund.us", "bundes-li.ga", "burnthespam.info", "burstmail.info", "buyusedlibrarybooks.org", "c2.hu", "cachedot.net", "casualdx.com", "cbair.com", "ce.mintemail.com", "cellurl.com", "centermail.com", "centermail.net", "chammy.info", "cheatmail.de", "chogmail.com", "choicemail1.com", "chong-mail.com", "chong-mail.net", "chong-mail.org", "clixser.com", "cmail.com", "cmail.net", "cmail.org", "coldemail.info", "consumerriot.com", "cool.fr.nf", "correo.blogos.net", "cosmorph.com", "courriel.fr.nf", "courrieltemporaire.com", "crapmail.org", "crazespaces.pw", "crazymailing.com", "cubiclink.com", "curryworld.de", "cust.in", "cuvox.de", "dacoolest.com", "daintly.com", "dandikmail.com", "dayrep.com", "dbunker.com", "dcemail.com", "deadaddress.com", "deadchildren.org", "deadfake.cf", "deadfake.ga", "deadfake.ml", "deadfake.tk", "deadspam.com", "deagot.com", "dealja.com", "despam.it", "despammed.com", "devnullmail.com", "dfgh.net", "dharmatel.net", "digitalsanctuary.com", "dingbone.com", "discard.cf", "discard.email", "discard.ga", "discard.gq", "discard.ml", "discard.tk", "discardmail.com", "discardmail.de", "disposable-email.ml", "disposable.cf", "disposable.ga", "disposable.ml", "disposableaddress.com", "disposableemailaddresses.com", "disposableemailaddresses.emailmiser.com", "disposableinbox.com", "dispose.it", "disposeamail.com", "disposemail.com", "dispostable.com", "divermail.com", "dm.w3internet.co.uk", "dodgeit.com", "dodgit.com", "dodgit.org", "doiea.com", "domozmail.com", "donemail.ru", "dontreg.com", "dontsendmespam.de", "dotmsg.com", "drdrb.com", "drdrb.net", "droplar.com", "dropmail.me", "duam.net", "dudmail.com", "dump-email.info", "dumpandjunk.com", "dumpmail.de", "dumpyemail.com", "duskmail.com", "e-mail.com", "e-mail.org", "e4ward.com", "easytrashmail.com", "eelmail.com", "einrot.com", "einrot.de", "email-fake.cf", "email-fake.ga", "email-fake.gq", "email-fake.ml", "email-fake.tk", "email60.com", "emailage.cf", "emailage.ga", "emailage.gq", "emailage.ml", "emailage.tk", "emaildienst.de", "emailgo.de", "emailias.com", "emailigo.de", "emailinfive.com", "emailisvalid.com", "emaillime.com", "emailmiser.com", "emailproxsy.com", "emails.ga", "emailsensei.com", "emailspam.cf", "emailspam.ga", "emailspam.gq", "emailspam.ml", "emailspam.tk", "emailtemporar.ro", "emailtemporario.com.br", "emailthe.net", "emailtmp.com", "emailto.de", "emailwarden.com", "emailx.at.hm", "emailxfer.com", "emailz.cf", "emailz.ga", "emailz.gq", "emailz.ml", "emeil.in", "emeil.ir", "emil.com", "emkei.cf", "emkei.ga", "emkei.gq", "emkei.ml", "emkei.tk", "emz.net", "enterto.com", "ephemail.net", "etranquil.com", "etranquil.net", "etranquil.org", "evopo.com", "explodemail.com", "eyepaste.com", "facebook-email.cf", "facebook-email.ga", "facebook-email.ml", "facebookmail.gq", "facebookmail.ml", "fake-mail.cf", "fake-mail.ga", "fake-mail.ml", "fakeinbox.cf", "fakeinbox.com", "fakeinbox.ga", "fakeinbox.ml", "fakeinbox.tk", "fakeinformation.com", "fakemail.fr", "fakemailgenerator.com", "fakemailz.com", "fammix.com", "fansworldwide.de", "fantasymail.de", "fastacura.com", "fastchevy.com", "fastchrysler.com", "fastkawasaki.com", "fastmazda.com", "fastmitsubishi.com", "fastnissan.com", "fastsubaru.com", "fastsuzuki.com", "fasttoyota.com", "fastyamaha.com", "fatflap.com", "fdfdsfds.com", "fightallspam.com", "fiifke.de", "filzmail.com", "fixmail.tk", "fizmail.com", "fleckens.hu", "flurred.com", "flyspam.com", "footard.com", "forgetmail.com", "fornow.eu", "fr33mail.info", "frapmail.com", "free-email.cf", "free-email.ga", "freemail.ms", "freemails.cf", "freemails.ga", "freemails.ml", "freundin.ru", "friendlymail.co.uk", "front14.org", "fuckingduh.com", "fudgerub.com", "fux0ringduh.com", "garliclife.com", "gawab.com", "gelitik.in", "get-mail.cf", "get-mail.ga", "get-mail.ml", "get-mail.tk", "get1mail.com", "get2mail.fr", "getairmail.cf", "getairmail.com", "getairmail.ga", "getairmail.gq", "getairmail.ml", "getairmail.tk", "getmails.eu", "getonemail.com", "getonemail.net", "ghosttexter.de", "girlsundertheinfluence.com", "gishpuppy.com", "goemailgo.com", "gorillaswithdirtyarmpits.com", "gotmail.com", "gotmail.net", "gotmail.org", "gotti.otherinbox.com", "gowikibooks.com", "gowikicampus.com", "gowikicars.com", "gowikifilms.com", "gowikigames.com", "gowikimusic.com", "gowikinetwork.com", "gowikitravel.com", "gowikitv.com", "grandmamail.com", "grandmasmail.com", "great-host.in", "greensloth.com", "grr.la", "gsrv.co.uk", "guerillamail.biz", "guerillamail.com", "guerillamail.net", "guerillamail.org", "guerrillamail.biz", "guerrillamail.com", "guerrillamail.de", "guerrillamail.net", "guerrillamail.org", "guerrillamailblock.com", "gustr.com", "h.mintemail.com", "h8s.org", "hacccc.com", "haltospam.com", "harakirimail.com", "hartbot.de", "hatespam.org", "hellodream.mobi", "herp.in", "hidemail.de", "hidzz.com", "hmamail.com", "hochsitze.com", "hopemail.biz", "hot-mail.cf", "hot-mail.ga", "hot-mail.gq", "hot-mail.ml", "hot-mail.tk", "hotpop.com", "hulapla.de", "humn.ws.gy", "ieatspam.eu", "ieatspam.info", "ieh-mail.de", "ihateyoualot.info", "iheartspam.org", "imails.info", "imgof.com", "imstations.com", "inbax.tk", "inbox.si", "inboxalias.com", "inboxclean.com", "inboxclean.org", "inboxproxy.com", "inboxstore.me", "incognitomail.com", "incognitomail.net", "incognitomail.org", "insorg-mail.info", "instant-mail.de", "instantemailaddress.com", "ipoo.org", "irish2me.com", "iroid.com", "iwi.net", "jetable.com", "jetable.fr.nf", "jetable.net", "jetable.org", "jnxjn.com", "jobbikszimpatizans.hu", "jourrapide.com", "jsrsolutions.com", "junk1e.com", "junkmail.ga", "junkmail.gq", "kasmail.com", "kaspop.com", "keepmymail.com", "killmail.com", "killmail.net", "kimsdisk.com", "kingsq.ga", "kir.ch.tc", "klassmaster.com", "klassmaster.net", "klzlk.com", "kook.ml", "koszmail.pl", "kulturbetrieb.info", "kurzepost.de", "l33r.eu", "labetteraverouge.at", "lackmail.net", "lags.us", "landmail.co", "lastmail.co", "lastmail.com", "lazyinbox.com", "letthemeatspam.com", "lhsdv.com", "lifebyfood.com", "link2mail.net", "litedrop.com", "loadby.us", "login-email.cf", "login-email.ga", "login-email.ml", "login-email.tk", "lol.ovpn.to", "lookugly.com", "lopl.co.cc", "lortemail.dk", "lovemeleaveme.com", "lr7.us", "lr78.com", "lroid.com", "luv2.us", "m4ilweb.info", "maboard.com", "mail-filter.com", "mail-temporaire.fr", "mail.by", "mail.mezimages.net", "mail114.net", "mail2rss.org", "mail333.com", "mail4trash.com", "mailbidon.com", "mailblocks.com", "mailbucket.org", "mailcat.biz", "mailcatch.com", "maildrop.cc", "maildrop.cf", "maildrop.ga", "maildrop.gq", "maildrop.ml", "maildx.com", "maileater.com", "mailexpire.com", "mailfa.tk", "mailforspam.com", "mailfree.ga", "mailfree.gq", "mailfree.ml", "mailfreeonline.com", "mailfs.com", "mailguard.me", "mailimate.com", "mailin8r.com", "mailinater.com", "mailinator.com", "mailinator.gq", "mailinator.net", "mailinator.org", "mailinator.us", "mailinator2.com", "mailincubator.com", "mailismagic.com", "mailjunk.cf", "mailjunk.ga", "mailjunk.gq", "mailjunk.ml", "mailjunk.tk", "mailmate.com", "mailme.gq", "mailme.ir", "mailme.lv", "mailme24.com", "mailmetrash.com", "mailmoat.com", "mailnator.com", "mailnesia.com", "mailnull.com", "mailpick.biz", "mailproxsy.com", "mailquack.com", "mailrock.biz", "mailsac.com", "mailscrap.com", "mailseal.de", "mailshell.com", "mailsiphon.com", "mailslapping.com", "mailslite.com", "mailtemp.info", "mailtothis.com", "mailzilla.com", "mailzilla.org", "mailzilla.orgmbx.cc", "makemetheking.com", "manifestgenerator.com", "manybrain.com", "mbx.cc", "mciek.com", "mega.zik.dj", "meinspamschutz.de", "meltmail.com", "messagebeamer.de", "mezimages.net", "mfsa.ru", "mierdamail.com", "migumail.com", "mintemail.com", "mjukglass.nu", "moakt.com", "mobi.web.id", "mobileninja.co.uk", "moburl.com", "mohmal.com", "moncourrier.fr.nf", "monemail.fr.nf", "monmail.fr.nf", "monumentmail.com", "ms9.mailslite.com", "msa.minsmail.com", "mt2009.com", "mt2014.com", "mx0.wwwnew.eu", "my10minutemail.com", "mycleaninbox.net", "myemailboxy.com", "mymail-in.net", "mymailoasis.com", "mynetstore.de", "mypacks.net", "mypartyclip.de", "myphantomemail.com", "myspaceinc.com", "myspaceinc.net", "myspaceinc.org", "myspacepimpedup.com", "myspamless.com", "mytemp.email", "mytempemail.com", "mytrashmail.com", "neomailbox.com", "nepwk.com", "nervmich.net", "nervtmich.net", "netmails.com", "netmails.net", "netzidiot.de", "neverbox.com", "nice-4u.com", "nmail.cf", "no-spam.ws", "nobulk.com", "noclickemail.com", "nogmailspam.info", "nomail.xl.cx", "nomail2me.com", "nomorespamemails.com", "nonspam.eu", "nonspammer.de", "noref.in", "nospam.wins.com.br", "nospam.ze.tc", "nospam4.us", "nospamfor.us", "nospamthanks.info", "notmailinator.com", "notsharingmy.info", "nowhere.org", "nowmymail.com", "ntlhelp.net", "nurfuerspam.de", "nus.edu.sg", "nwldx.com", "objectmail.com", "obobbo.com", "odaymail.com", "one-time.email", "oneoffemail.com", "oneoffmail.com", "onewaymail.com", "online.ms", "oopi.org", "opayq.com", "ordinaryamerican.net", "otherinbox.com", "ourklips.com", "outlawspam.com", "ovpn.to", "owlpic.com", "pancakemail.com", "paplease.com", "pcusers.otherinbox.com", "pepbot.com", "pfui.ru", "pimpedupmyspace.com", "pjjkp.com", "plexolan.de", "poczta.onet.pl", "politikerclub.de", "poofy.org", "pookmail.com", "postacin.com", "privacy.net", "privy-mail.com", "privymail.de", "proxymail.eu", "prtnx.com", "prtz.eu", "punkass.com", "putthisinyourspamdatabase.com", "pwrby.com", "qasti.com", "qisdo.com", "qisoa.com", "quickinbox.com", "quickmail.nl", "radiku.ye.vc", "rcpt.at", "reallymymail.com", "receiveee.chickenkiller.com", "receiveee.com", "recode.me", "reconmail.com", "recursor.net", "recyclemail.dk", "regbypass.com", "regbypass.comsafe-mail.net", "rejectmail.com", "remail.cf", "remail.ga", "rhyta.com", "rk9.chickenkiller.com", "rklips.com", "rmqkr.net", "royal.net", "rppkn.com", "rtrtr.com", "ruffrey.com", "s0ny.net", "safe-mail.net", "safersignup.de", "safetymail.info", "safetypost.de", "sandelf.de", "saynotospams.com", "scatmail.com", "schafmail.de", "selfdestructingmail.com", "selfdestructingmail.org", "sendspamhere.com", "sharedmailbox.org", "sharklasers.com", "shieldedmail.com", "shiftmail.com", "shitmail.me", "shitmail.org", "shitware.nl", "shortmail.net", "showslow.de", "sibmail.com", "sinnlos-mail.de", "siteposter.net", "skeefmail.com", "slaskpost.se", "slave-auctions.net", "slopsbox.com", "slushmail.com", "smashmail.de", "smellfear.com", "smellrear.com", "snakemail.com", "sneakemail.com", "snkmail.com", "sofimail.com", "sofort-mail.de", "softpls.asia", "sogetthis.com", "sohu.com", "soisz.com", "solvemail.info", "soodomail.com", "soodonims.com", "spam-be-gone.com", "spam.la", "spam.su", "spam4.me", "spamavert.com", "spambob.com", "spambob.net", "spambob.org", "spambog.com", "spambog.de", "spambog.net", "spambog.ru", "spambooger.com", "spambox.info", "spambox.irishspringrealty.com", "spambox.us", "spamcannon.com", "spamcannon.net", "spamcero.com", "spamcon.org", "spamcorptastic.com", "spamcowboy.com", "spamcowboy.net", "spamcowboy.org", "spamday.com", "spamdecoy.net", "spamex.com", "spamfighter.cf", "spamfighter.ga", "spamfighter.gq", "spamfighter.ml", "spamfighter.tk", "spamfree.eu", "spamfree24.com", "spamfree24.de", "spamfree24.eu", "spamfree24.info", "spamfree24.net", "spamfree24.org", "spamgoes.in", "spamgourmet.com", "spamgourmet.net", "spamgourmet.org", "spamherelots.com", "spamhereplease.com", "spamhole.com", "spamify.com", "spaminator.de", "spamkill.info", "spaml.com", "spaml.de", "spammotel.com", "spamobox.com", "spamoff.de", "spamsalad.in", "spamslicer.com", "spamspot.com", "spamstack.net", "spamthis.co.uk", "spamthisplease.com", "spamtrail.com", "spamtroll.net", "speed.1s.fr", "spikio.com", "spoofmail.de", "squizzy.de", "ssoia.com", "startkeys.com", "stinkefinger.net", "stop-my-spam.cf", "stop-my-spam.com", "stop-my-spam.ga", "stop-my-spam.ml", "stop-my-spam.tk", "streetwisemail.com", "stuffmail.de", "supergreatmail.com", "supermailer.jp", "superrito.com", "superstachel.de", "suremail.info", "svk.jp", "sweetxxx.de", "tafmail.com", "tagyourself.com", "talkinator.com", "tapchicuoihoi.com", "teewars.org", "teleworm.com", "teleworm.us", "temp.emeraldwebmail.com", "temp.headstrong.de", "tempalias.com", "tempe-mail.com", "tempemail.biz", "tempemail.co.za", "tempemail.com", "tempemail.net", "tempinbox.co.uk", "tempinbox.com", "tempmail.it", "tempmail2.com", "tempmaildemo.com", "tempmailer.com", "tempomail.fr", "temporarily.de", "temporarioemail.com.br", "temporaryemail.net", "temporaryemail.us", "temporaryforwarding.com", "temporaryinbox.com", "tempsky.com", "tempthe.net", "tempymail.com", "thanksnospam.info", "thankyou2010.com", "thecloudindex.com", "thisisnotmyrealemail.com", "throam.com", "throwawayemailaddress.com", "throwawaymail.com", "tilien.com", "tittbit.in", "tmail.ws", "tmailinator.com", "toiea.com", "toomail.biz", "tradermail.info", "trash-amil.com", "trash-mail.at", "trash-mail.cf", "trash-mail.com", "trash-mail.de", "trash-mail.ga", "trash-mail.gq", "trash-mail.ml", "trash-mail.tk", "trash2009.com", "trash2010.com", "trash2011.com", "trashdevil.com", "trashdevil.de", "trashemail.de", "trashmail.at", "trashmail.com", "trashmail.de", "trashmail.me", "trashmail.net", "trashmail.org", "trashmail.ws", "trashmailer.com", "trashymail.com", "trashymail.net", "trayna.com", "trbvm.com", "trickmail.net", "trillianpro.com", "tryalert.com", "turual.com", "twinmail.de", "twoweirdtricks.com", "tyldd.com", "ubismail.net", "uggsrock.com", "umail.net", "unmail.ru", "upliftnow.com", "uplipht.com", "uroid.com", "username.e4ward.com", "valemail.net", "venompen.com", "veryrealemail.com", "vidchart.com", "viditag.com", "viewcastmedia.com", "viewcastmedia.net", "viewcastmedia.org", "vomoto.com", "vubby.com", "walala.org", "walkmail.net", "webemail.me", "webm4il.info", "webuser.in", "wee.my", "weg-werf-email.de", "wegwerf-email-addressen.de", "wegwerf-emails.de", "wegwerfadresse.de", "wegwerfemail.de", "wegwerfmail.de", "wegwerfmail.info", "wegwerfmail.net", "wegwerfmail.org", "wetrainbayarea.com", "wetrainbayarea.org", "wh4f.org", "whatiaas.com", "whatpaas.com", "whatsaas.com", "whopy.com", "whtjddn.33mail.com", "whyspam.me", "wickmail.net", "wilemail.com", "willselfdestruct.com", "winemaven.info", "wmail.cf", "wollan.info", "wronghead.com", "wuzup.net", "wuzupmail.net", "www.e4ward.com", "www.gishpuppy.com", "www.mailinator.com", "wwwnew.eu", "xagloo.com", "xemaps.com", "xents.com", "xmaily.com", "xoxox.cc", "xoxy.net", "xyzfree.net", "yapped.net", "yeah.net", "yep.it", "yert.ye.vc", "yogamaven.com", "yomail.info", "yopmail.com", "yopmail.fr", "yopmail.gq", "yopmail.net", "youmail.ga", "ypmail.webarnak.fr.eu.org", "yuurok.com", "za.com", "zehnminutenmail.de", "zetmail.com", "zippymail.info", "zoaxe.com", "zoemail.com", "zoemail.net", "zoemail.org", "zomg.info", "zxcv.com", "zxcvbnm.com", "zzz.com"];
      var tmp_domain = req.param('email').split("@");
      if(domain_blacklist.indexOf(tmp_domain[1])!=-1)
      {
        var requireLoginError = ['The email that you registered has been blocked by us!!! Please give the valid one...!!!!!'];
          req.session.flash = {
                err: requireLoginError
          }
        return res.redirect('/register');
      }
      if(req.param('password')!=req.param('confirmationpassword')){
          var requireLoginError = ['Your password and your confirmation password is not same.'];
          req.session.flash = {
                err: requireLoginError
          }
        return res.redirect('/register');
      }
      User.findOne({ or : [ {username : req.param('username')}, { email: req.param('email') } ] },function foundUser(err,user){
           if(err) return next(err);
           if(user){
                var requireLoginError = ['Your requested email or username has been taken by another users. Please give another one.'];
                req.session.flash = {
                        err: requireLoginError
                }
                res.redirect('/register');
                return;
           }
           if(!user){
               University.findOne({'val_name':req.param('university')}, function(err,university){
                   var usrObj = {
                        email : req.param('email'),
                        username : req.param('username'),
                        name : req.param('name'),
                        rating : 1500,
                        highest_rating : 1500,
                        gender : req.param('gender'),
                        university : university.id,
                }
                bcrypt.hash(req.param('password'), 10, function PasswordEncrypted(err, encryptedPassword) {
                    usrObj.password = encryptedPassword;
                    User.create(usrObj, function (err, user1) {
                        if(err) return next(err);
                        bcrypt.hash(user1.id, 10, function IDEncrypted(err, encryptedId) {
                            while(encryptedId.indexOf('/') > -1) {
                                var encryptedId = encryptedId.replace('/','');
                            }
                            if(encryptedId.indexOf('/') == -1) {
                                var usr = {
                                    encryptedId : encryptedId
                               }
                               User.update(user1.id, usr, function userUpdated(err) {
                                    if (err) return next(err);
                                    var requireLoginError = ['You have success to register. Please check your email for verification.'];
                                    req.session.flash = {
                                       success: requireLoginError
                                    }
                                    var transporter = nodemailer.createTransport('smtps://iseloom.adm%40gmail.com:iseloomiseloom@smtp.gmail.com');
                                    var mailOptions = {
                                        from: 'Iseloom <iseloom.adm@gmail.com>', // sender address 
                                        to: user1.email, // list of receivers 
                                        subject: 'Activate Your Iseloom Account', // Subject line 
                                        text: "Hola "+user1.name+"\r\n\r\nThanks for signing up for Iseloom.\r\nPlease activate your account by clicking the link below.\r\n\r\n"+req.baseUrl+'/activate/'+encryptedId,
                                        html: "<h1>Hola "+user1.name+"</h1>"+"<p>Thanks for signing up for Iseloom.</p><p>Please activate your account by clicking the button below.</p><a href='"+req.baseUrl+"/activate/"+encryptedId+"'><button>Click Here!</button></a>" // html body 
                                    };
                                    transporter.sendMail(mailOptions, function(error, info){
                                        if(error){
                                            return console.log(error);
                                        }
                                    });
                                    res.redirect('/login');
                                    return;
                                });
                            }
                        });
                    })
                });
               }); 
           }
      });   
    },
    'login_user' : function(req,res,next){
        var tmp = req.param('email');
        var remember_me = true;
		if(typeof req.param('_remember_me')=="undefined")
			remember_me = false;
        var email = tmp.toLowerCase();
        if (!req.param('email') || !req.param('password')) {
			var usernamePasswordRequiredError = ['You must enter both a username and password.']
			// Remember that err is the object being passed down (a.k.a. flash.err), whose value is another object with
			// the key of usernamePasswordRequiredError
			req.session.flash = {
				err: usernamePasswordRequiredError,
			}
			res.redirect('/login');
			return;
		}
        User.findOne({ or : [ {username : email}, { email: email } ] }, function foundUser(err, user) {
            if (err) return next(err);
            // If no user is found...
			if (!user) {
				var noAccountError = [
				 'The email address / username ' + req.param('email') + ' not found.'
				]
				req.session.flash = {
					err: noAccountError,
				}
				res.redirect('/login');
				return;
			}
            bcrypt.compare(req.param('password'), user.password, function(err, valid) {
                if (err) return next(err);
                if (!valid) {
					var usernamePasswordMismatchError = ['Invalid username and password combination.']
					req.session.flash = {
						err: usernamePasswordMismatchError,
					}
					res.redirect('/login');
					return;
				}
                if(!user.activation && !user.admin) {
                    var usernamePasswordMismatchError = ["Your account has not yet activated. Please check your email to activate your account."];
                    req.session.flash = {
                        err: usernamePasswordMismatchError,
                    }
                    req.session.notConfirm = true;
                    res.redirect('/login');
                    return;
                }
                if(!user.verification) {
                    var usernamePasswordMismatchError = ['Your account has not yet verified by administrator. Please contact the administrator.'];
					req.session.flash = {
						err: usernamePasswordMismatchError,
					}
					res.redirect('/login');
					return;
                }
                req.session.authenticated = true;
			    req.session.User = user;
                if(remember_me)
					req.session.cookie.maxAge = 1000 * 60 * 60 * 24 * 30;
				else
					req.session.cookie.maxAge = 60 * 60 * 1000;
                return res.redirect('/');
            });
        });
    },
    logout : function(req,res,next){
        if(!req.session.authenticated) return res.redirect('/');
        User.findOne(req.session.User.id, function foundUser(err, user) {
            if(err) return next(err);
            if(user){
                // Wipe out the session (log out)
				req.session.destroy();

				// Redirect the browser to the sign-in screen
				res.redirect('/');
            }
        });
    },
    'activation' : function(req,res,next) {
        User.findOne({ 'encryptedId' : req.param('id') }, function foundUser(err, user) {
            if(err) return next(err);
            if(!user) {
                var noAccountError = [
                 'Account not found!'
                ]
                req.session.flash = {
                    err: noAccountError,
                }
                res.redirect('/login');
                return;
            } else {
                bcrypt.hash(user.encryptedId, 10, function IDEncrypted(err, encryptedId) {
                    while(encryptedId.indexOf('/') > -1) {
                        var encryptedId = encryptedId.replace('/','');
                    }
                    User.update({'encryptedId' : req.param('id')}, {'activation':true, 'encryptedId':encryptedId}, function(err,user){
                        var activateSuccess = [
                         'Your account has been activated!'
                        ]
                        req.session.flash = {
                            success: activateSuccess,
                        }
                        res.redirect('/login');
                        return;
                    });
                });
            }
        })
    }
};

